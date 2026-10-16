"""
AVVA Insights — Backend API (tenant-aware)
==========================================
Reads tenantId from JWT, looks up tenant's DynamoDB tables,
scopes every query to that tenant's data.

Environment variables:
- TENANTS_TABLE: avva-tenants (master registry)
- AI_PROVIDER, AI_API_KEY, AI_MODEL: AI proxy config
- JWT_SECRET: token signing key
- ALLOWED_ORIGINS: CORS allowlist
"""

import json
import os
import time
import uuid
import hashlib
import hmac
import base64
import urllib.request
import urllib.error

import boto3

dynamodb = boto3.resource('dynamodb')

JWT_SECRET = os.environ.get('JWT_SECRET', 'change-me')
JWT_EXPIRY_HOURS = 24
DEFAULT_TENANT = 'reemerge'

# Fallback table names if a tenant has no custom tables yet
DEFAULT_TABLES = {
    'users': 'avva-users-prod',
    'workspaces': 'avva-workspaces-prod',
    'programmes': 'avva-programmes-prod',
    'audit': 'avva-audit-prod'
}


def lambda_handler(event, context):
    try:
        method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
        if method == 'OPTIONS':
            return resp(200, {'message': 'CORS OK'})

        path = event.get('rawPath', '/')
        if path.startswith('/prod'):
            path = path[5:]

        body = {}
        if event.get('body'):
            try:
                body = json.loads(event['body'])
            except json.JSONDecodeError:
                return resp(400, {'error': 'Invalid JSON body'})

        headers = event.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization') or ''

        # Route table
        routes = {
            ('POST', '/auth/signup'): lambda: handle_signup(body),
            ('POST', '/auth/login'): lambda: handle_login(body),
            ('GET', '/auth/me'): lambda: handle_me(auth_header),

            ('GET', '/workspaces'): lambda: handle_list_ws(auth_header),
            ('POST', '/workspaces'): lambda: handle_create_ws(auth_header, body),
            ('DELETE', '/workspaces'): lambda: handle_delete_ws(auth_header, body),

            ('GET', '/programmes'): lambda: handle_list_prog(auth_header, event),
            ('POST', '/programmes'): lambda: handle_create_prog(auth_header, body),
            ('DELETE', '/programmes'): lambda: handle_delete_prog(auth_header, body),

            ('POST', '/ai/chat'): lambda: handle_ai_chat(auth_header, body),

            ('GET', '/tenants'): lambda: handle_list_tenants(auth_header),
            ('POST', '/tenants'): lambda: handle_create_tenant(auth_header, body),

            ('GET', '/health'): lambda: resp(200, {'status': 'ok', 'time': int(time.time())}),
        }

        handler = routes.get((method, path))
        if not handler:
            return resp(404, {'error': f'No route for {method} {path}'})
        return handler()

    except Exception as e:
        print(f'[ERROR] {type(e).__name__}: {str(e)}')
        import traceback
        traceback.print_exc()
        return resp(500, {'error': 'Internal server error', 'detail': str(e)})


# ---------- TENANT RESOLUTION ----------

def get_tenant_tables(tenant_id):
    """Look up tenant's DynamoDB tables from avva-tenants registry."""
    if not tenant_id:
        tenant_id = DEFAULT_TENANT
    try:
        tenants_tbl = dynamodb.Table('avva-tenants')
        result = tenants_tbl.get_item(Key={'id': tenant_id})
        if 'Item' not in result:
            print(f'[WARN] Tenant {tenant_id} not found, using defaults')
            return {
                'users': dynamodb.Table(DEFAULT_TABLES['users']),
                'workspaces': dynamodb.Table(DEFAULT_TABLES['workspaces']),
                'programmes': dynamodb.Table(DEFAULT_TABLES['programmes']),
                'audit': dynamodb.Table(DEFAULT_TABLES['audit'])
            }
        tables = result['Item'].get('tables', {})
        return {
            'users': dynamodb.Table(tables.get('users', DEFAULT_TABLES['users'])),
            'workspaces': dynamodb.Table(tables.get('workspaces', DEFAULT_TABLES['workspaces'])),
            'programmes': dynamodb.Table(tables.get('programmes', DEFAULT_TABLES['programmes'])),
            'audit': dynamodb.Table(tables.get('audit', DEFAULT_TABLES['audit']))
        }
    except Exception as e:
        print(f'[ERROR] get_tenant_tables: {e}')
        return {
            'users': dynamodb.Table(DEFAULT_TABLES['users']),
            'workspaces': dynamodb.Table(DEFAULT_TABLES['workspaces']),
            'programmes': dynamodb.Table(DEFAULT_TABLES['programmes']),
            'audit': dynamodb.Table(DEFAULT_TABLES['audit'])
        }


# ---------- AUTH ----------

def handle_signup(body):
    tenant_id = (body.get('tenantId') or DEFAULT_TENANT).strip().lower()
    tables = get_tenant_tables(tenant_id)
    users = tables['users']

    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    name = (body.get('name') or '').strip()
    role = body.get('role') or 'Viewer'
    workspaces = body.get('workspaces') or {}

    if not email or not password or not name:
        return resp(400, {'error': 'Email, password, and name are required'})
    if len(password) < 6:
        return resp(400, {'error': 'Password must be at least 6 characters'})

    existing = users.get_item(Key={'email': email})
    if 'Item' in existing:
        return resp(409, {'error': 'An account with this email already exists'})

    user = {
        'email': email,
        'name': name,
        'role': role,
        'passwordHash': hash_pwd(password),
        'workspaces': workspaces,
        'tenantId': tenant_id,
        'createdAt': int(time.time()),
        'active': True
    }
    users.put_item(Item=user)
    log_audit(tenant_id, 'signup', email, {'email': email})

    token = make_jwt({'email': email, 'name': name, 'role': role, 'workspaces': workspaces, 'tenantId': tenant_id})
    return resp(200, {'token': token, 'user': public_user(user)})


def handle_login(body):
    tenant_id = (body.get('tenantId') or DEFAULT_TENANT).strip().lower()
    tables = get_tenant_tables(tenant_id)
    users = tables['users']

    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or not password:
        return resp(400, {'error': 'Email and password are required'})

    result = users.get_item(Key={'email': email})
    if 'Item' not in result:
        return resp(401, {'error': 'Invalid email or password'})

    user = result['Item']
    if not user.get('active', True):
        return resp(401, {'error': 'Account is disabled'})
    if not verify_pwd(password, user.get('passwordHash', '')):
        return resp(401, {'error': 'Invalid email or password'})

    workspaces = user.get('workspaces', {}) or {}
    user_tenant = user.get('tenantId', tenant_id)
    token = make_jwt({
        'email': email,
        'name': user['name'],
        'role': user['role'],
        'workspaces': workspaces,
        'tenantId': user_tenant
    })
    log_audit(user_tenant, 'login', email, {'email': email})
    return resp(200, {'token': token, 'user': public_user(user)})


def handle_me(auth_header):
    user = read_jwt(auth_header)
    if not user:
        return resp(401, {'error': 'Not authenticated'})
    return resp(200, {'user': user})


# ---------- WORKSPACES ----------

def handle_list_ws(auth_header):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    tenant_id = u.get('tenantId') or DEFAULT_TENANT
    tables = get_tenant_tables(tenant_id)
    tbl = tables['workspaces']

    if u['workspaces'].get('*'):
        scan = tbl.scan()
        return resp(200, {'workspaces': scan.get('Items', [])})
    else:
        items = []
        for ws_id in u['workspaces'].keys():
            r = tbl.get_item(Key={'id': ws_id})
            if 'Item' in r:
                items.append(r['Item'])
        return resp(200, {'workspaces': items})


def handle_create_ws(auth_header, body):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    tenant_id = u.get('tenantId') or DEFAULT_TENANT
    tables = get_tenant_tables(tenant_id)

    ws = {
        'id': body.get('id') or f'ws-{uuid.uuid4().hex[:8]}',
        'workspaceName': body.get('workspaceName', 'Untitled'),
        'pageSubtitle': body.get('pageSubtitle', ''),
        'ownerEmail': u['email'],
        'tenantId': tenant_id,
        'createdAt': int(time.time()),
        'config': body.get('config', {}),
        'districts': body.get('districts', {}),
        'metrics': body.get('metrics', []),
        'source': body.get('source', 'csv')
    }
    tables['workspaces'].put_item(Item=ws)
    log_audit(tenant_id, 'workspace.create', u['email'], {'workspaceId': ws['id']})
    return resp(200, {'workspace': ws})


def handle_delete_ws(auth_header, body):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    tenant_id = u.get('tenantId') or DEFAULT_TENANT
    tables = get_tenant_tables(tenant_id)
    ws_id = body.get('id')
    if not ws_id:
        return resp(400, {'error': 'id required'})
    tables['workspaces'].delete_item(Key={'id': ws_id})
    log_audit(tenant_id, 'workspace.delete', u['email'], {'workspaceId': ws_id})
    return resp(200, {'deleted': True})


# ---------- PROGRAMMES ----------

def handle_list_prog(auth_header, event):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    tenant_id = u.get('tenantId') or DEFAULT_TENANT
    tables = get_tenant_tables(tenant_id)

    params = event.get('queryStringParameters') or {}
    ws_id = params.get('workspaceId')
    if not ws_id:
        return resp(400, {'error': 'workspaceId required'})

    r = tables['programmes'].query(
        KeyConditionExpression='workspaceId = :w',
        ExpressionAttributeValues={':w': ws_id}
    )
    return resp(200, {'programmes': r.get('Items', [])})


def handle_create_prog(auth_header, body):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    tenant_id = u.get('tenantId') or DEFAULT_TENANT
    tables = get_tenant_tables(tenant_id)

    ws_id = body.get('workspaceId')
    if not ws_id:
        return resp(400, {'error': 'workspaceId required'})

    p = {
        'workspaceId': ws_id,
        'id': body.get('id') or f'prog-{uuid.uuid4().hex[:8]}',
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
        'postedBy': u['email'],
        'tenantId': tenant_id,
        'postedAt': int(time.time())
    }
    tables['programmes'].put_item(Item=p)
    log_audit(tenant_id, 'programme.create', u['email'], {'programmeId': p['id']})
    return resp(200, {'programme': p})


def handle_delete_prog(auth_header, body):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    tenant_id = u.get('tenantId') or DEFAULT_TENANT
    tables = get_tenant_tables(tenant_id)

    ws_id = body.get('workspaceId')
    prog_id = body.get('id')
    if not ws_id or not prog_id:
        return resp(400, {'error': 'workspaceId and id required'})

    tables['programmes'].delete_item(Key={'workspaceId': ws_id, 'id': prog_id})
    log_audit(tenant_id, 'programme.delete', u['email'], {'programmeId': prog_id})
    return resp(200, {'deleted': True})


# ---------- TENANTS (platform admin only) ----------

def handle_list_tenants(auth_header):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    if u.get('tenantId') != DEFAULT_TENANT:
        return resp(403, {'error': 'Platform admin only'})
    try:
        tbl = dynamodb.Table('avva-tenants')
        r = tbl.scan()
        return resp(200, {'tenants': r.get('Items', [])})
    except Exception as e:
        return resp(500, {'error': str(e)})


def handle_create_tenant(auth_header, body):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})
    if u.get('tenantId') != DEFAULT_TENANT:
        return resp(403, {'error': 'Platform admin only'})

    tenant_id = (body.get('id') or '').strip().lower()
    if not tenant_id or len(tenant_id) < 3:
        return resp(400, {'error': 'id required (min 3 chars, lowercase)'})

    try:
        tbl = dynamodb.Table('avva-tenants')
        tenant = {
            'id': tenant_id,
            'label': body.get('label', tenant_id),
            'shortLabel': body.get('shortLabel', tenant_id),
            'status': body.get('status', 'active'),
            'workspaces': body.get('workspaces', []),
            'defaultWorkspace': body.get('defaultWorkspace', ''),
            'tables': {
                'users': f'avva-users-{tenant_id}',
                'workspaces': f'avva-workspaces-{tenant_id}',
                'programmes': f'avva-programmes-{tenant_id}',
                'audit': f'avva-audit-{tenant_id}'
            },
            'branding': body.get('branding', {'accent': '#4f25d8'}),
            'plan': body.get('plan', 'starter'),
            'createdAt': int(time.time())
        }
        tbl.put_item(Item=tenant)
        return resp(200, {'tenant': tenant})
    except Exception as e:
        return resp(500, {'error': str(e)})


# ---------- AI ----------

def handle_ai_chat(auth_header, body):
    u = read_jwt(auth_header)
    if not u:
        return resp(401, {'error': 'Not authenticated'})

    api_key = os.environ.get('AI_API_KEY', '')
    if not api_key:
        return resp(503, {
            'error': 'AI not configured',
            'reply': 'AI is not yet configured. Please contact your administrator.'
        })

    provider = os.environ.get('AI_PROVIDER', 'openai')
    model = os.environ.get('AI_MODEL', 'gpt-4o-mini')
    messages = body.get('messages', [])
    context = body.get('context', '')
    system = body.get('systemPrompt', 'You are AVVA Assistant.')

    full = [{'role': 'system', 'content': system + ('\n\n' + context if context else '')}]
    full.extend(messages)

    if provider in ('openai', 'groq'):
        base = 'https://api.openai.com/v1/chat/completions'
        if provider == 'groq':
            base = 'https://api.groq.com/openai/v1/chat/completions'
        return proxy_openai(base, api_key, model, full)
    elif provider == 'gemini':
        return proxy_gemini(api_key, model, full)
    else:
        return resp(400, {'error': f'Unknown provider: {provider}'})


def proxy_openai(base_url, api_key, model, messages):
    payload = json.dumps({'model': model, 'messages': messages, 'temperature': 0.7, 'max_tokens': 500}).encode('utf-8')
    req = urllib.request.Request(base_url, data=payload, headers={
        'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'
    }, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.loads(r.read().decode('utf-8'))
            return resp(200, {'reply': data['choices'][0]['message']['content']})
    except urllib.error.HTTPError as e:
        return resp(500, {'error': f'AI error {e.code}', 'detail': e.read().decode('utf-8')[:200]})
    except Exception as e:
        return resp(500, {'error': str(e)})


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
        with urllib.request.urlopen(req, timeout=25) as r:
            data = json.loads(r.read().decode('utf-8'))
            return resp(200, {'reply': data['candidates'][0]['content']['parts'][0]['text']})
    except Exception as e:
        return resp(500, {'error': str(e)})


# ---------- AUDIT ----------

def log_audit(tenant_id, action, actor_email, metadata=None):
    try:
        tables = get_tenant_tables(tenant_id)
        now = int(time.time())
        tables['audit'].put_item(Item={
            'pk': action,
            'timestamp': now,
            'actor': actor_email,
            'tenantId': tenant_id,
            'metadata': metadata or {},
            'ttl': now + (90 * 24 * 60 * 60)
        })
    except Exception as e:
        print(f'[AUDIT ERROR] {e}')


# ---------- JWT (pure Python, no external deps) ----------

def b64(b):
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()


def make_jwt(payload):
    secret = JWT_SECRET.encode()
    header = b64(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    p = dict(payload)
    p['iat'] = int(time.time())
    p['exp'] = int(time.time()) + (JWT_EXPIRY_HOURS * 3600)
    body = b64(json.dumps(p).encode())
    sig = b64(hmac.new(secret, (header + '.' + body).encode(), hashlib.sha256).digest())
    return header + '.' + body + '.' + sig


def read_jwt(auth):
    if not auth or not auth.startswith('Bearer '):
        return None
    try:
        parts = auth[7:].split('.')
        if len(parts) != 3:
            return None
        secret = JWT_SECRET.encode()
        expected = b64(hmac.new(secret, (parts[0] + '.' + parts[1]).encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(expected, parts[2]):
            return None
        pad = '=' * (-len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + pad))
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


# ---------- PASSWORD ----------

def hash_pwd(p):
    salt = JWT_SECRET[:16]
    return hashlib.sha256((salt + p).encode()).hexdigest()


def verify_pwd(p, h):
    return hash_pwd(p) == h


# ---------- RESPONSE ----------

def public_user(u):
    return {
        'email': u['email'],
        'name': u['name'],
        'role': u['role'],
        'workspaces': u.get('workspaces', {}),
        'tenantId': u.get('tenantId', DEFAULT_TENANT)
    }


def resp(code, body):
    return {
        'statusCode': code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }
