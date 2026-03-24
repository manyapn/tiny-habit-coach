"""
Flask App Factory — app/__init__.py
"""

from flask import Flask
from flask_cors import CORS
from .db.schema import init_db


def create_app():
    app = Flask(__name__)
    CORS(app)  # Allow all origins in development

    # Initialize the database 
    init_db()

    # Register all route blueprints
    from .routes import users, habits, checkins, ai, stats
    app.register_blueprint(users.bp)
    app.register_blueprint(habits.bp)
    app.register_blueprint(checkins.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(stats.bp)

    # Health check
    @app.route('/health')
    def health():
        return {'status': 'ok'}

    return app
