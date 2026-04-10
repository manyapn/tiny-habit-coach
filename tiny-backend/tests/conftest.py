"""
Shared pytest fixtures.
"""

import pytest
from unittest.mock import patch, MagicMock


@pytest.fixture
def app():
    """Flask test app with all DB connections mocked out."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.fetchone.return_value = None
    mock_cursor.fetchall.return_value = []

    with patch('psycopg2.connect', return_value=mock_conn):
        from app import create_app
        a = create_app()
        a.config['TESTING'] = True
        yield a


@pytest.fixture
def client(app):
    return app.test_client()
