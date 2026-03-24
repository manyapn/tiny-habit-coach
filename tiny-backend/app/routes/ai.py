"""
AI Proxy route — POST /ai/chat
"""

from flask import Blueprint, request, jsonify
import anthropic
from ..prompts.onboarding import ONBOARDING_PROMPT
from ..prompts.missed_day import build_missed_day_prompt
from ..prompts.weekly import build_weekly_prompt

bp = Blueprint('ai', __name__)
client = anthropic.Anthropic()  

PROMPT_MAP = {
    'onboarding': lambda ctx: ONBOARDING_PROMPT,
    'missed_day': lambda ctx: build_missed_day_prompt(ctx),
    'weekly':     lambda ctx: build_weekly_prompt(ctx),
}


@bp.route('/ai/chat', methods=['POST'])
def ai_chat():
    data = request.json
    key = data.get('system_prompt_key', 'onboarding')
    messages = data.get('messages', [])
    context = data.get('context', {})

    if key not in PROMPT_MAP:
        return jsonify({'error': f'Unknown prompt key: {key}'}), 400

    system = PROMPT_MAP[key](context)

    SEED_MESSAGES = {
        'onboarding': 'Hello, I want to build a new habit.',
        'missed_day': 'I missed my habit today.',
        'weekly':     'I want to do my weekly review.',
    }
    if not messages:
        messages = [{'role': 'user', 'content': SEED_MESSAGES.get(key, 'Hello.')}]

    try:
        response = client.messages.create(
            model='claude-sonnet-4-20250514',
            max_tokens=300,
            system=system,
            messages=messages
        )
        return jsonify({'reply': response.content[0].text.strip()})
    except anthropic.AuthenticationError:
        return jsonify({'error': 'Invalid API key'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500
