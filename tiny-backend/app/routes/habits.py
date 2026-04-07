"""
Habits routes: POST /habits, GET /habits/<user_id>, PUT /habits/<id>

PUT /habits/<id> is used for redesigns when the missed-day coach
suggests changing the time, location, or two-minute version,
and the user agrees. Only the fields that changed are sent.
"""

from flask import Blueprint, request, jsonify
from ..db.queries import create_habit, get_habit_by_user, update_habit
from ..auth import require_auth

bp = Blueprint('habits', __name__)

# create habit
@bp.route('/habits', methods=['POST'])
@require_auth
def post_habit():
    d = request.json
    required = ['user_id', 'action', 'time', 'location', 'two_minute']
    for field in required:
        if not d.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    habit = create_habit(
        user_id=d['user_id'],
        action=d['action'],
        time=d['time'],
        location=d['location'],
        two_minute=d['two_minute'],
        why=d.get('why'),
        habit_stack=d.get('habit_stack')
    )
    return jsonify(habit), 201

# get habit
@bp.route('/habits/<user_id>', methods=['GET'])
@require_auth
def get_habit(user_id):
    habit = get_habit_by_user(user_id)
    if not habit:
        return jsonify({'error': 'No habit found'}), 404
    return jsonify(habit)

# update habit
@bp.route('/habits/<int:habit_id>', methods=['PUT'])
@require_auth
def put_habit(habit_id):
    """Update specific fields on a habit. Body contains only the changed fields."""
    data = request.json
    allowed = {'action', 'time', 'location', 'two_minute', 'why', 'habit_stack'}
    fields = {k: v for k, v in data.items() if k in allowed}
    if not fields:
        return jsonify({'error': 'No valid fields to update'}), 400
    updated = update_habit(habit_id, fields)
    return jsonify(updated)
