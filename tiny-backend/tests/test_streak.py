"""
Unit tests for calculate_streak(): no database required.
"""

import pytest
from datetime import date, timedelta
from app.db.queries import calculate_streak

TODAY = "2024-06-15"


def days_ago(n):
    return (date.fromisoformat(TODAY) - timedelta(days=n)).isoformat()


class TestCalculateStreak:
    def test_empty_checkins_returns_zero(self):
        assert calculate_streak({}, TODAY) == 0

    def test_single_completed_today(self):
        assert calculate_streak({TODAY: 1}, TODAY) == 1

    def test_single_missed_today(self):
        # completed=0 counts as a break, not just absence
        assert calculate_streak({TODAY: 0}, TODAY) == 0

    def test_streak_from_yesterday_when_today_not_checked_in(self):
        # User hasn't checked in today yet: streak should still count from yesterday
        checkins = {days_ago(1): 1, days_ago(2): 1}
        assert calculate_streak(checkins, TODAY) == 2

    def test_three_consecutive_days(self):
        checkins = {TODAY: 1, days_ago(1): 1, days_ago(2): 1}
        assert calculate_streak(checkins, TODAY) == 3

    def test_streak_stops_at_gap(self):
        # days_ago(1) is missing: streak from today is just 1
        checkins = {TODAY: 1, days_ago(2): 1, days_ago(3): 1}
        assert calculate_streak(checkins, TODAY) == 1

    def test_streak_stops_at_missed_day(self):
        checkins = {TODAY: 1, days_ago(1): 0, days_ago(2): 1}
        assert calculate_streak(checkins, TODAY) == 1

    def test_long_streak(self):
        checkins = {(date.fromisoformat(TODAY) - timedelta(days=i)).isoformat(): 1
                    for i in range(14)}
        assert calculate_streak(checkins, TODAY) == 14

    def test_all_missed_returns_zero(self):
        checkins = {TODAY: 0, days_ago(1): 0, days_ago(2): 0}
        assert calculate_streak(checkins, TODAY) == 0

    def test_streak_ignores_future_dates(self):
        tomorrow = (date.fromisoformat(TODAY) + timedelta(days=1)).isoformat()
        checkins = {tomorrow: 1, TODAY: 1, days_ago(1): 1}
        # Should only count from today back
        assert calculate_streak(checkins, TODAY) == 2
