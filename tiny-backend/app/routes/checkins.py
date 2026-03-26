"""
Checkins routes — POST /checkins, GET /checkins/<user_id>, GET /checkins/<user_id>/streak
Also: POST /redesigns

HOW CHECK-INS WORK:
  Every day, the user taps YES or NOT TODAY.
  completed=1 (yes) or completed=0 (not today)
  friction_note captures WHY they missed (sent to the AI missed-day prompt)
  redesigned=1 means the habit was redesigned after this check-in

THE STREAK ALGORITHM (in queries.py):
  Walk backwards from today. Count consecutive completed=1 days.
  Stop at the first miss or missing date. A day with no check-in = broken streak.

DATE FORMAT: ISO 8601 string "YYYY-MM-DD"
  We store dates as text in SQLite. ISO format sorts correctly as text,
  which makes range queries (ORDER BY date DESC) work without any conversion.
"""

from flask import Blueprint, request, jsonify
from ..db.queries import log_checkin, get_checkins, get_streak, save_redesign

bp = Blueprint('checkins', __name__)

# log check in
@bp.route('/checkins', methods=['POST'])
def post_checkin():
    d = request.json
    required = ['user_id', 'habit_id', 'date', 'completed']
    for field in required:
        if d.get(field) is None:
            return jsonify({'error': f'{field} is required'}), 400

    checkin = log_checkin(
        user_id=d['user_id'],
        habit_id=d['habit_id'],
        date=d['date'],
        completed=int(d['completed']),
        friction_note=d.get('friction_note'),
        redesigned=d.get('redesigned', 0)
    )
    return jsonify(checkin), 201

# get check in
@bp.route('/checkins/<user_id>', methods=['GET'])
def get_user_checkins(user_id):
    checkins = get_checkins(user_id)
    return jsonify(checkins)

# get streak
@bp.route('/checkins/<user_id>/streak', methods=['GET'])
def get_user_streak(user_id):
    today = request.args.get('today')  # YYYY-MM-DD in user's local timezone
    streak = get_streak(user_id, today=today)
    return jsonify({'streak': streak})

# redesign habit
@bp.route('/redesigns', methods=['POST'])
def post_redesign():
    d = request.json
    save_redesign(
        habit_id=d['habit_id'],
        trigger_reason=d.get('trigger_reason'),
        old_action=d.get('old_action'),
        new_action=d.get('new_action'),
        new_time=d.get('new_time'),
        new_location=d.get('new_location'),
        new_two_minute=d.get('new_two_minute')
    )
    return jsonify({'status': 'saved'}), 201
