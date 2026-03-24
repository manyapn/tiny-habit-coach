"""
Users route: POST /users
"""

from flask import Blueprint, request, jsonify
from ..db.queries import upsert_user, save_user_name
from ..db.schema import get_db

bp = Blueprint('users', __name__)

# create a user if not already using app (user history saved in localStorage)
@bp.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user_id = data.get('id')
    if not user_id:
        return jsonify({'error': 'id is required'}), 400
    user = upsert_user(user_id)
    return jsonify(user), 201

# save user's name
@bp.route('/users/<user_id>/name', methods=['PUT'])
def update_name(user_id):
    name = request.json.get('name', '').strip()
    if not name:
        return jsonify({'error': 'name is required'}), 400
    save_user_name(user_id, name)
    return jsonify({'status': 'saved'})

# delete user history
@bp.route('/users/<user_id>/reset', methods=['DELETE'])
def reset_user(user_id):
    """Delete all data for a user. The frontend will clear localStorage and restart."""
    conn = get_db()
    # Get habit IDs first so we can cascade to redesigns
    habit_ids = [row['id'] for row in conn.execute(
        'SELECT id FROM habits WHERE user_id = ?', (user_id,)
    ).fetchall()]
    if habit_ids:
        placeholders = ','.join('?' * len(habit_ids))
        conn.execute(f'DELETE FROM redesigns WHERE habit_id IN ({placeholders})', habit_ids)
    conn.execute('DELETE FROM checkins WHERE user_id = ?', (user_id,))
    conn.execute('DELETE FROM habits WHERE user_id = ?', (user_id,))
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'status': 'reset'})
