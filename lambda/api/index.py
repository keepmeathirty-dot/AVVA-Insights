"""
AVVA Insights — Backend API
============================
This is a single Lambda function that serves all AVVA API endpoints.

Route dispatch happens inside lambda_handler, based on the request path
and method. Data lives in 4 DynamoDB tables:
- avva-users-{env}:       user accounts
- avva-workspaces-{env}:  saved workspaces (from CSV uploads)
- avva-programmes-{env}:  posted programmes
- avva-audit-{env}:       audit log (auto-deleted after 90 days)

Environment variables (set by CloudFormation):
- USERS_TABLE, WORKSPACES_TABLE, PROGRAMMES_TABLE, AUDIT_TABLE
- JWT_SECRET: secret key for signing login tokens
- AI_PROVIDER, AI_API_KEY, AI_MODEL: AI proxy config
- ALLOWED_ORIGINS: comma-separated list of allowed frontend origins

To deploy: see cloudformation/avva-backend.yaml
"""

import json
import os
import time
import uuid
import hashlib
import urllib.request
import urllib.error

import jwt
import boto3

# ---------- AWS CLIENTS ----------
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])
workspaces_table = dynamodb.Table(os.environ['WORKSPACES_TABLE'])
programmes_table = dynamodb.Table(os.environ['PROGRAMMES_TABLE'])
audit_table = dynamodb.Table(os.environ['AUDIT_TABLE'])

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me-in-production')
JWT_ALGO = 'HS256'
JWT_EXPIRY_HOURS = 24


# ================================================================
# MAIN ENTRY POINT
# ================================================================
def lambda_handler(event, context):
    """AWS calls this for every request. We route by path + method."""
    try:
        # CORS preflight
        method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
        if method == 'OPTIONS':
            return cors_response(200, {'message': 'CORS OK'})

        # Extract path, method, body
        path = event.get('rawPath', '/')
        if path.startswith('/prod'):
            path = path[5:]  # strip stage prefix if present
        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return cors_response(400, {'error': 'Invalid JSON body'})

        headers = event.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization') or ''

        # ---- ROUTING TABLE ----
        # Each route = (method, path) → handler function

        routes = {
            ('POST', '/auth/signup'):    lambda: handle_signup(body),
            ('POST', '/auth/login'):     lambda: handle_login(body),
            ('GET',  '/auth/me'):        lambda: handle_me(auth_header),

            ('GET',  '/workspaces'):     lambda: handle_list_workspaces(auth_header),
            ('POST', '/workspaces'):     lambda: handle_create_workspace(auth_header, body),
            ('GET',  '/workspaces/get'): lambda: handle_get_workspace(auth_header, event),
            ('DELETE','/workspaces'):    lambda: handle_delete_workspace(auth_header, body),

            ('GET',  '/programmes'):     lambda: handle_list_programmes(auth_header, event),
            ('POST', '/programmes'):     lambda: handle_create_programme(auth_header, body),
            ('DELETE','/programmes'):    lambda: handle_delete_programme(auth_header, body),

            ('POST', '/ai/chat'):        lambda: handle_ai_chat(auth_header, body),

            ('GET',  '/audit'):          lambda: handle_audit_list(auth_header, event),
            ('GET',  '/health'):         lambda: cors_response(200, {'status': 'ok', 'time': int(time.time())})
        }

        handler = routes.get((method, path))
        if not handler:
            return cors_response(404, {'error': f'No route for {method} {path}'})

        return handler()

    except Exception as e:
        # Log the error so we can debug from CloudWatch
        print(f'[ERROR] {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()
        return cors_response(500, {'error': 'Internal server error', 'detail': str(e)})


# ================================================================
# AUTH HANDLERS
# ================================================================

def handle_signup(body):
    """Create a new user account."""
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    name = (body.get('name') or '').strip()
    role = body.get('role') or 'Viewer'

    if not email or not password or not name:
        return cors_response(400, {'error': 'Email, password, and name are required'})
    if len(password) < 8:
        return cors_response(400, {'error': 'Password must be at least 8 characters'})

    # Check if user already exists
    existing = users_table.get_item(Key={'email': email})
    if 'Item' in existing:
        return cors_response(409, {'error': 'An account with this email already exists'})

    # Hash the password (SHA-256 + salt for demo; use bcrypt in production)
    password_hash = hash_password(password)

    # Default workspaces: empty (admin assigns later)
    user = {
        'email': email,
        'name': name,
        'role': role,
        'passwordHash': password_hash,
        'workspaces': {},   # { workspaceId: role }
        'createdAt': int(time.time()),
        'active': True
    }

    users_table.put_item(Item=user)
    log_audit('signup', email, {'email': email, 'name': name})

    # Issue JWT
    token = create_jwt(email, name, role, {})
    return cors_response(200, {
        'token': token,
        'user': {
            'email': email,
            'name': name,
            'role': role,
            'workspaces': {}
        }
    })


def handle_login(body):
    """Authenticate a user and return a JWT."""
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or not password:
        return cors_response(400, {'error': 'Email and password are required'})

    result = users_table.get_item(Key={'email': email})
    if 'Item' not in result:
        return cors_response(401, {'error': 'Invalid email or password'})

    user = result['Item']
    if not user.get('active', True):
        return cors_response(401, {'error': 'Account is disabled'})

    if not verify_password(password, user['passwordHash']):
        return cors_response(401, {'error': 'Invalid email or password'})

    token = create_jwt(email, user['name'], user['role'], user.get('workspaces', {}))
    log_audit('login', email, {'email': email})

    return cors_response(200, {
        'token': token,
        'user': {
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'workspaces': user.get('workspaces', {})
        }
    })


def handle_me(auth_header):
    """Return the current user's profile."""
    payload = decode_jwt(auth_header)
    if not payload:
        return cors_response(401, {'error': 'Not authenticated'})
    return cors_response(200, {'user': payload})


# ================================================================
# WORKSPACE HANDLERS
# ================================================================

def handle_list_workspaces(auth_header):
    """Return all workspaces the current user can access."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    # Admin sees everything; others see only their assigned workspaces
    workspaces = []
    if user.get('role') == 'Platform Admin' or user['workspaces'].get('*'):
        scan = workspaces_table.scan()
        workspaces = scan.get('Items', [])
    else:
        for ws_id in user['workspaces'].keys():
            result = workspaces_table.get_item(Key={'id': ws_id})
            if 'Item' in result:
                workspaces.append(result['Item'])

    return cors_response(200, {'workspaces': workspaces})


def handle_create_workspace(auth_header, body):
    """Create a new workspace (from CSV upload, typically)."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    workspace = {
        'id': body.get('id') or f'workspace-{uuid.uuid4().hex[:12]}',
        'workspaceName': body.get('workspaceName', 'Untitled'),
        'pageSubtitle': body.get('pageSubtitle', ''),
        'ownerEmail': user['email'],
        'createdAt': int(time.time()),
        'config': body.get('config', {}),
        'districts': body.get('districts', {}),
        'metrics': body.get('metrics', []),
        'source': body.get('source', 'csv-upload')
    }

    workspaces_table.put_item(Item=workspace)
    log_audit('workspace.create', user['email'], {'workspaceId': workspace['id']})

    return cors_response(200, {'workspace': workspace})


def handle_get_workspace(auth_header, event):
    """Fetch a single workspace by ID."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    params = event.get('queryStringParameters') or {}
    ws_id = params.get('id')
    if not ws_id:
        return cors_response(400, {'error': 'Workspace ID required'})

    result = workspaces_table.get_item(Key={'id': ws_id})
    if 'Item' not in result:
        return cors_response(404, {'error': 'Workspace not found'})

    ws = result['Item']

    # Permission check
    if user.get('role') != 'Platform Admin' and ws['ownerEmail'] != user['email'] and not user['workspaces'].get('*'):
        if ws_id not in user['workspaces']:
            return cors_response(403, {'error': 'Access denied'})

    return cors_response(200, {'workspace': ws})


def handle_delete_workspace(auth_header, body):
    """Delete a workspace. Only owner or admin."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    ws_id = body.get('id')
    if not ws_id:
        return cors_response(400, {'error': 'Workspace ID required'})

    result = workspaces_table.get_item(Key={'id': ws_id})
    if 'Item' not in result:
        return cors_response(404, {'error': 'Workspace not found'})

    ws = result['Item']
    if user.get('role') != 'Platform Admin' and ws['ownerEmail'] != user['email']:
        return cors_response(403, {'error': 'Only the owner can delete this workspace'})

    workspaces_table.delete_item(Key={'id': ws_id})
    log_audit('workspace.delete', user['email'], {'workspaceId': ws_id})
    return cors_response(200, {'deleted': True})


# ================================================================
# PROGRAMME HANDLERS
# ================================================================

def handle_list_programmes(auth_header, event):
    """List programmes for a workspace."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    params = event.get('queryStringParameters') or {}
    ws_id = params.get('workspaceId')
    if not ws_id:
        return cors_response(400, {'error': 'workspaceId required'})

    result = programmes_table.query(
        KeyConditionExpression='workspaceId = :w',
        ExpressionAttributeValues={':w': ws_id}
    )
    return cors_response(200, {'programmes': result.get('Items', [])})


def handle_create_programme(auth_header, body):
    """Create a new programme."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    ws_id = body.get('workspaceId')
    if not ws_id:
        return cors_response(400, {'error': 'workspaceId required'})

    programme = {
        'workspaceId': ws_id,
        'id': body.get('id') or f'prog-{uuid.uuid4().hex[:12]}',
        'name': body.get('name', 'Untitled programme'),
        'sector': body.get('sector', ''),
        'type': body.get('type', ''),
        'budget': body.get('budget', ''),
        'beneficiaries': body.get('beneficiaries', ''),
        'beneficiaryType': body.get('beneficiaryType', ''),
        'districts': body.get('districts', []),
        'start': body.get('start', ''),
        'end': body.get('end', ''),
        'description': body.get('description', ''),
        'billingRef': body.get('billingRef', ''),
        'status': body.get('status', 'Active'),
        'postedBy': user['email'],
        'postedAt': int(time.time())
    }

    programmes_table.put_item(Item=programme)
    log_audit('programme.create', user['email'], {'programmeId': programme['id']})
    return cors_response(200, {'programme': programme})


def handle_delete_programme(auth_header, body):
    """Delete a programme."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    ws_id = body.get('workspaceId')
    prog_id = body.get('id')
    if not ws_id or not prog_id:
        return cors_response(400, {'error': 'workspaceId and id required'})

    programmes_table.delete_item(Key={'workspaceId': ws_id, 'id': prog_id})
    log_audit('programme.delete', user['email'], {'programmeId': prog_id})
    return cors_response(200, {'deleted': True})


# ================================================================
# AI CHAT PROXY
# ================================================================

def handle_ai_chat(auth_header, body):
    """Proxy chat requests to the AI provider. Keeps API key server-side."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    provider = os.environ.get('AI_PROVIDER', 'openai')
    api_key = os.environ.get('AI_API_KEY', '')
    model = os.environ.get('AI_MODEL', 'gpt-4o-mini')

    if not api_key:
        return cors_response(503, {
            'error': 'AI is not configured. Set AI_API_KEY in Lambda environment variables.',
            'demo': True,
            'reply': 'AI is not yet configured on this workspace. Please contact your administrator.'
        })

    messages = body.get('messages', [])
    workspace_context = body.get('context', '')
    system_prompt = body.get('systemPrompt', 'You are a helpful assistant for AVVA Insights.')

    # Build full message list with system prompt + workspace context
    full_messages = [{'role': 'system', 'content': system_prompt + ('\n\n' + workspace_context if workspace_context else '')}]
    full_messages.extend(messages)

    if provider in ('openai', 'groq'):
        base = 'https://api.openai.com/v1/chat/completions'
        if provider == 'groq':
            base = 'https://api.groq.com/openai/v1/chat/completions'
        return proxy_openai(base, api_key, model, full_messages)
    elif provider == 'gemini':
        return proxy_gemini(api_key, model, full_messages)
    else:
        return cors_response(400, {'error': f'Unknown AI provider: {provider}'})


def proxy_openai(base_url, api_key, model, messages):
    payload = json.dumps({'model': model, 'messages': messages, 'temperature': 0.7, 'max_tokens': 500}).encode('utf-8')
    req = urllib.request.Request(base_url, data=payload, headers={
        'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'
    }, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return cors_response(200, {'reply': data['choices'][0]['message']['content']})
    except urllib.error.HTTPError as e:
        return cors_response(500, {'error': f'AI error {e.code}', 'detail': e.read().decode('utf-8')[:200]})
    except Exception as e:
        return cors_response(500, {'error': str(e)})


def proxy_gemini(api_key, model, messages):
    system = ''
    contents = []
    for m in messages:
        if m['role'] == 'system':
            system = m['content']
        else:
            role = 'user' if m['role'] == 'user' else 'model'
            contents.append({'role': role, 'parts': [{'text': m['content']}]})
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}'
    payload = {'contents': contents}
    if system:
        payload['systemInstruction'] = {'parts': [{'text': system}]}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'),
                                  headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return cors_response(200, {'reply': data['candidates'][0]['content']['parts'][0]['text']})
    except Exception as e:
        return cors_response(500, {'error': str(e)})


# ================================================================
# AUDIT LOG
# ================================================================

def handle_audit_list(auth_header, event):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    if user.get('role') != 'Platform Admin':
        return cors_response(403, {'error': 'Admin only'})

    params = event.get('queryStringParameters') or {}
    limit = int(params.get('limit', 50))
    result = audit_table.scan(Limit=limit)
    return cors_response(200, {'entries': result.get('Items', [])})


def log_audit(action, actor_email, metadata=None):
    """Write an audit entry. Auto-deleted after 90 days via TTL."""
    try:
        now = int(time.time())
        audit_table.put_item(Item={
            'pk': action,
            'timestamp': now,
            'actor': actor_email,
            'metadata': metadata or {},
            'ttl': now + (90 * 24 * 60 * 60)
        })
    except Exception as e:
        print(f'[AUDIT ERROR] {e}')


# ================================================================
# JWT HELPERS
# ================================================================

def create_jwt(email, name, role, workspaces):
    payload = {
        'email': email,
        'name': name,
        'role': role,
        'workspaces': workspaces,
        'iat': int(time.time()),
        'exp': int(time.time()) + (JWT_EXPIRY_HOURS * 3600)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_jwt(auth_header):
    """Extract and validate JWT from Authorization header."""
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    try:
        return jwt.decode(parts[1], JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ================================================================
# PASSWORD HELPERS
# ================================================================

def hash_password(password):
    """Simple hash — replace with bcrypt for production."""
    salt = os.environ.get('JWT_SECRET', 'avva-salt')[:16]
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()


def verify_password(password, stored_hash):
    return hash_password(password) == stored_hash


# ================================================================
# CORS
# ================================================================

def cors_response(status, body):
    """Every response includes CORS headers so the frontend can call it."""
    allowed = os.environ.get('ALLOWED_ORIGINS', '*')
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': allowed,
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
