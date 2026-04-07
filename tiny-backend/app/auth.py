"""
JWT verification for Supabase auth tokens (ES256 via JWKS).
"""

import os
from functools import wraps
import jwt
from jwt import PyJWKClient
from flask import request, jsonify, g

JWKS_URL = os.environ.get('SUPABASE_JWKS_URL')
_jwks_client = None

def _get_jwks_client():
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = PyJWKClient(JWKS_URL)
    return _jwks_client

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'unauthorized'}), 401
        token = auth[7:]
        try:
            client = _get_jwks_client()
            signing_key = client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=['ES256'],
                options={'verify_aud': False}
            )
            g.user_id = payload['sub']
        except Exception:
            return jsonify({'error': 'invalid token'}), 401
        return f(*args, **kwargs)
    return decorated
