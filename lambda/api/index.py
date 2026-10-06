"""
AVVA Insights — Backend API (complete)
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

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])
workspaces_table = dynamodb.Table(os.environ['WORKSPACES_TABLE'])
programmes_table = dynamodb.Table(os.environ['PROGRAMMES_TABLE'])
audit_table = dynamodb.Table(os.environ['AUDIT_TABLE'])

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_ALGO = 'HS256'
JWT_EXPIRY_HOURS = 24


def lambda_handler(event, context):
    try:
        method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
        if method == 'OPTIONS':
            return cors_response(200, {'message': 'CORS OK'})

        path = event.get('rawPath', '/')
        if path.startswith('/prod'):
            path = path[5:]

        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return cors_response(400, {'error': 'Invalid JSON body'})

        headers = event.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization') or ''

        routes = {
            ('POST', '/auth/signup'): lambda: handle_signup(body),
            ('POST', '/auth/login'): lambda: handle_login(body),
            ('GET', '/auth/me'): lambda: handle_me(auth_header),

            ('GET', '/workspaces'): lambda: handle_list_workspaces(auth_header),
            ('POST', '/workspaces'): lambda: handle_create_workspace(auth_header, body),
            ('DELETE', '/workspaces'): lambda: handle_delete_workspace(auth_header, body),

            ('GET', '/programmes'): lambda: handle_list_programmes(auth_header, event),
            ('POST', '/programmes'): lambda: handle_create_programme(auth_header, body),
            ('DELETE', '/programmes'): lambda: handle_delete_programme(auth_header, body),

            ('POST', '/ai/chat'): lambda: handle_ai_chat(auth_header, body),

            ('POST', '/admin/set-workspaces'): lambda: handle_set_workspaces(auth_header, body),
            ('POST', '/admin/create-user'): lambda: handle_admin_create_user(auth_header, body),
            ('GET', '/admin/users'): lambda: handle_admin_list_users(auth_header),

            ('GET', '/audit'): lambda: handle_audit_list(auth_header, event),
            ('GET', '/health'): lambda: cors_response(200, {'status': 'ok', 'time': int(time.time())}),
        }

        handler = routes.get((method, path))
        if not handler:
            return cors_response(404, {'error': f'No route for {method} {path}'})
        return handler()

    except Exception as e:
        print(f'[ERROR] {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()
        return cors_response(500, {'error': 'Internal server error', 'detail': str(e)})


# ---------- AUTH ----------

def handle_signup(body):
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    name = (body.get('name') or '').strip()
    role = body.get('role') or 'Viewer'
    workspaces = body.get('workspaces') or {}

    if not email or not password or not name:
        return cors_response(400, {'error': 'Email, password, and name are required'})
    if len(password) < 6:
        return cors_response(400, {'error': 'Password must be at least 6 characters'})

    existing = users_table.get_item(Key={'email': email})
    if 'Item' in existing:
        return cors_response(409, {'error': 'An account with this email already exists'})

    user = {
        'email': email,
        'name': name,
        'role': role,
        'passwordHash': hash_password(password),
        'workspaces': workspaces,
        'createdAt': int(time.time()),
        'active': True
    }
    users_table.put_item(Item=user)
    log_audit('signup', email, {'email': email})

    token = create_jwt(email, name, role, workspaces)
    return cors_response(200, {'token': token, 'user': public_user(user)})


def handle_login(body):
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

    workspaces = user.get('workspaces', {}) or {}
    token = create_jwt(email, user['name'], user['role'], workspaces)
    log_audit('login', email, {'email': email})
    return cors_response(200, {'token': token, 'user': public_user(user)})


def handle_me(auth_header):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    return cors_response(200, {'user': user})


# ---------- WORKSPACES ----------

def handle_list_workspaces(auth_header):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    workspaces = []
    if user['workspaces'].get('*'):
        scan = workspaces_table.scan()
        workspaces = scan.get('Items', [])
    else:
        for ws_id in user['workspaces'].keys():
            result = workspaces_table.get_item(Key={'id': ws_id})
            if 'Item' in result:
                workspaces.append(result['Item'])

    return cors_response(200, {'workspaces': workspaces})


def handle_create_workspace(auth_header, body):
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


def handle_delete_workspace(auth_header, body):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    ws_id = body.get('id')
    if not ws_id:
        return cors_response(400, {'error': 'id required'})
    result = workspaces_table.get_item(Key={'id': ws_id})
    if 'Item' not in result:
        return cors_response(404, {'error': 'Not found'})
    ws = result['Item']
    if not user['workspaces'].get('*') and ws['ownerEmail'] != user['email']:
        return cors_response(403, {'error': 'Not authorized'})
    workspaces_table.delete_item(Key={'id': ws_id})
    log_audit('workspace.delete', user['email'], {'workspaceId': ws_id})
    return cors_response(200, {'deleted': True})


# ---------- PROGRAMMES ----------

def handle_list_programmes(auth_header, event):
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
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    ws_id = body.get('workspaceId')
    if not ws_id:
        return cors_response(400, {'error': 'workspaceId required'})
    programme = {
        'workspaceId': ws_id,
        'id': body.get('id') or f'prog-{uuid.uuid4().hex[:12]}',
        'name': body.get('name', 'Untitled'),
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


# ---------- ADMIN ----------

def handle_set_workspaces(auth_header, body):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    if user.get('role') != 'Platform Admin':
        return cors_response(403, {'error': 'Admin only'})
    target = (body.get('email') or '').strip().lower()
    workspaces = body.get('workspaces') or {}
    if not target:
        return cors_response(400, {'error': 'email required'})
    try:
        users_table.update_item(
            Key={'email': target},
            UpdateExpression='SET workspaces = :w',
            ExpressionAttributeValues={':w': workspaces}
        )
        log_audit('admin.set-workspaces', user['email'], {'target': target, 'workspaces': workspaces})
        return cors_response(200, {'updated': True, 'email': target, 'workspaces': workspaces})
    except Exception as e:
        return cors_response(500, {'error': str(e)})


def handle_admin_create_user(auth_header, body):
    """Admin endpoint: create a user with workspaces pre-assigned."""
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    if user.get('role') != 'Platform Admin':
        return cors_response(403, {'error': 'Admin only'})

    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    name = body.get('name') or email
    role = body.get('role') or 'Manager'
    workspaces = body.get('workspaces') or {}

    if not email or not password:
        return cors_response(400, {'error': 'email and password required'})

    existing = users_table.get_item(Key={'email': email})
    if 'Item' in existing:
        users_table.update_item(
            Key={'email': email},
            UpdateExpression='SET workspaces = :w, #n = :n, #r = :r',
            ExpressionAttributeNames={'#n': 'name', '#r': 'role'},
            ExpressionAttributeValues={':w': workspaces, ':n': name, ':r': role}
        )
        return cors_response(200, {'created': False, 'updated': True, 'email': email})

    new_user = {
        'email': email,
        'name': name,
        'role': role,
        'passwordHash': hash_password(password),
        'workspaces': workspaces,
        'createdAt': int(time.time()),
        'active': True
    }
    users_table.put_item(Item=new_user)
    log_audit('admin.create-user', user['email'], {'target': email})
    return cors_response(200, {'created': True, 'user': public_user(new_user)})


def handle_admin_list_users(auth_header):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})
    if user.get('role') != 'Platform Admin':
        return cors_response(403, {'error': 'Admin only'})
    scan = users_table.scan()
    items = [public_user(u) for u in scan.get('Items', [])]
    return cors_response(200, {'users': items})


# ---------- AI ----------

def handle_ai_chat(auth_header, body):
    user = decode_jwt(auth_header)
    if not user:
        return cors_response(401, {'error': 'Not authenticated'})

    provider = os.environ.get('AI_PROVIDER', 'openai')
    api_key = os.environ.get('AI_API_KEY', '')
    model = os.environ.get('AI_MODEL', 'gpt-4o-mini')

    if not api_key:
        return cors_response(503, {
            'error': 'AI not configured',
            'reply': 'AI is not yet configured. Please contact your administrator.'
        })

    messages = body.get('messages', [])
    workspace_context = body.get('context', '')
    system_prompt = body.get('systemPrompt', 'You are AVVA Assistant.')

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
        return cors_response(400, {'error': f'Unknown provider {provider}'})


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


# ---------- AUDIT ----------

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


# ---------- HELPERS ----------

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


def hash_password(password):
    salt = os.environ.get('JWT_SECRET', 'avva-salt')[:16]
    return hashlib.sha256((salt + password).encode('utf-8')).hexdigest()


def verify_password(password, stored_hash):
    return hash_password(password) == stored_hash


def public_user(user):
    return {
        'email': user['email'],
        'name': user['name'],
        'role': user['role'],
        'workspaces': user.get('workspaces', {})
    }


def cors_response(status, body):
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
