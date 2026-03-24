"""
Database query helpers — app/db/queries.py
"""

from .schema import get_db
from datetime import datetime


# USERS

def upsert_user(user_id: str):
    """Insert user if not exists, return the user row either way."""
    conn = get_db()
    conn.execute(
        "INSERT OR IGNORE INTO users (id) VALUES (?)",
        (user_id,)
    )
    conn.commit()
    user = conn.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()
    return dict(user)


def save_user_name(user_id: str, name: str):
    conn = get_db()
    conn.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
    conn.commit()
    conn.close()


# HABITS

def create_habit(user_id, action, time, location, two_minute, why=None, habit_stack=None):
    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO habits (user_id, action, time, location, two_minute, why, habit_stack)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (user_id, action, time, location, two_minute, why, habit_stack)
    )
    habit_id = cursor.lastrowid
    conn.commit()
    habit = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
    conn.close()
    return dict(habit)


def get_habit_by_user(user_id: str):
    """Return the most recently created habit for a user."""
    conn = get_db()
    row = conn.execute(
        "SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def update_habit(habit_id: int, fields: dict):
    """Update specific fields on a habit row. Used for redesigns."""
    if not fields:
        return
    
    # Build SET clause dynamically from the fields dict
    # e.g. fields={'action': 'meditate', 'time': '7am'} -> "action=?, time=?"
    
    set_clause = ", ".join(f"{k}=?" for k in fields)
    values = list(fields.values()) + [habit_id]
    conn = get_db()
    conn.execute(
        f"UPDATE habits SET {set_clause}, updated_at=CURRENT_TIMESTAMP WHERE id=?",
        values
    )
    conn.commit()
    habit = conn.execute("SELECT * FROM habits WHERE id = ?", (habit_id,)).fetchone()
    conn.close()
    return dict(habit) if habit else None


# CHECK INS
def log_checkin(user_id, habit_id, date, completed, friction_note=None, redesigned=0):
    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO checkins (user_id, habit_id, date, completed, friction_note, redesigned)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user_id, habit_id, date, completed, friction_note, redesigned)
    )
    checkin_id = cursor.lastrowid
    conn.commit()
    row = conn.execute("SELECT * FROM checkins WHERE id = ?", (checkin_id,)).fetchone()
    conn.close()
    return dict(row)


def get_checkins(user_id: str, limit:int):
    """Return the last N check-ins for a user, most recent first."""
    conn = get_db()
    rows = conn.execute(
        """SELECT * FROM checkins WHERE user_id = ?
           ORDER BY date DESC LIMIT ?""",
        (user_id, limit)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_streak(user_id: str) -> int:
    """
    Count consecutive completed days ending today (or yesterday)."""
    from datetime import date, timedelta
    conn = get_db()
    rows = conn.execute(
        """SELECT date, completed FROM checkins
           WHERE user_id = ? ORDER BY date DESC LIMIT 60""",
        (user_id,)
    ).fetchall()
    conn.close()

    if not rows:
        return 0

    checkin_map = {r['date']: r['completed'] for r in rows}
    today = date.today().isoformat()

    # Start from today if checked in, otherwise from yesterday
    cursor_date = date.today() if today in checkin_map else date.today() - timedelta(days=1)

    streak = 0
    while True:
        d = cursor_date.isoformat()
        if d not in checkin_map:
            break
        if checkin_map[d] != 1:
            break
        streak += 1
        cursor_date -= timedelta(days=1)

    return streak


# REDESIGN

def save_redesign(habit_id, trigger_reason, old_action, new_action,
                  new_time, new_location, new_two_minute):
    conn = get_db()
    conn.execute(
        """INSERT INTO redesigns
           (habit_id, trigger_reason, old_action, new_action, new_time, new_location, new_two_minute)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (habit_id, trigger_reason, old_action, new_action, new_time, new_location, new_two_minute)
    )
    conn.commit()
    conn.close()


# STATS

def get_stats(user_id: str) -> dict:
    """
    Aggregate stats for the stats route and weekly review context.
    Returns: streak, completion_rate (last 30 days), redesign_count, days_since_start.
    """
    conn = get_db()

    # Days since user created their first habit
    habit_row = conn.execute(
        "SELECT created_at FROM habits WHERE user_id = ? ORDER BY created_at ASC LIMIT 1",
        (user_id,)
    ).fetchone()

    if not habit_row:
        conn.close()
        return {'streak': 0, 'completion_rate': 0, 'redesign_count': 0, 'days_since_start': 0}

    created = datetime.fromisoformat(habit_row['created_at'])
    days_since_start = (datetime.utcnow() - created).days + 1

    # Last 30 check-ins
    rows = conn.execute(
        "SELECT completed FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 30",
        (user_id,)
    ).fetchall()
    total = len(rows)
    completed_count = sum(1 for r in rows if r['completed'] == 1)
    completion_rate = completed_count / total if total > 0 else 0

    # Redesign count (all time)
    habit_id_row = conn.execute(
        "SELECT id FROM habits WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    redesign_count = 0
    if habit_id_row:
        r = conn.execute(
            "SELECT COUNT(*) as c FROM redesigns WHERE habit_id = ?",
            (habit_id_row['id'],)
        ).fetchone()
        redesign_count = r['c']

    conn.close()
    return {
        'streak': get_streak(user_id),
        'completion_rate': completion_rate,
        'redesign_count': redesign_count,
        'days_since_start': days_since_start
    }
