"""
Route smoke tests: verify auth gating and basic response shapes.
"""


class TestHealth:
    def test_health_returns_ok(self, client):
        res = client.get('/health')
        assert res.status_code == 200
        assert res.get_json()['status'] == 'ok'


class TestAuthGating:
    """Every protected route must reject requests with no token."""

    def test_get_habit_requires_auth(self, client):
        res = client.get('/habits/user-123')
        assert res.status_code == 401

    def test_post_habit_requires_auth(self, client):
        res = client.post('/habits', json={})
        assert res.status_code == 401

    def test_put_habit_requires_auth(self, client):
        res = client.put('/habits/1', json={'action': 'run'})
        assert res.status_code == 401

    def test_get_checkins_requires_auth(self, client):
        res = client.get('/checkins/user-123')
        assert res.status_code == 401

    def test_post_checkin_requires_auth(self, client):
        res = client.post('/checkins', json={})
        assert res.status_code == 401

    def test_ai_chat_requires_auth(self, client):
        res = client.post('/ai/chat', json={})
        assert res.status_code == 401

    def test_stats_requires_auth(self, client):
        res = client.get('/stats/user-123')
        assert res.status_code == 401


class TestAuthErrorFormat:
    def test_missing_bearer_prefix_returns_401(self, client):
        res = client.get('/habits/user-123',
                         headers={'Authorization': 'notabearer'})
        assert res.status_code == 401
        assert 'error' in res.get_json()
