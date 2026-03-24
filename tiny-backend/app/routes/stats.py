"""
Stats route: GET /stats/<user_id>

Returns aggregated data used by:
  1. Home.jsx: display streak + completion rate
  2. Weekly.jsx: build context object for the weekly AI review prompt
"""

from flask import Blueprint, jsonify
from ..db.queries import get_stats

bp = Blueprint('stats', __name__)

# get stats
@bp.route('/stats/<user_id>', methods=['GET'])
def user_stats(user_id):
    stats = get_stats(user_id)
    return jsonify(stats)
