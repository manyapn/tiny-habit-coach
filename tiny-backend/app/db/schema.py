"""
Database schema for Tiny Habit Coach.
  - users: ID + timestamp
  - habits: Implementation Intention (action, time, location, two_minute) plus why + habit_stack from the onboarding conversation.
  - checkins: one row per day. completed=1 (YES) or 0 (NOT TODAY). friction_note captures WHY they missed. redesigned=1 means we changed the habit.
  - redesigns: Every time the AI suggests a habit change and the user accepts, we save the old vs new version here. This lets us track how many times the habit was redesigned and compare versions over time.
"""

import os
import psycopg2
import psycopg2.extras

DATABASE_URL = os.environ.get('DATABASE_URL')


def get_db():
    """Return a database connection. Each request gets its own connection."""
    conn = psycopg2.connect(DATABASE_URL)
    return conn


def get_cursor(conn):
    """Return a RealDictCursor so rows behave like dicts: row['column_name']"""
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_db():
    """Create all tables if they don't already exist. Safe to call on every startup."""
    conn = get_db()
    cursor = get_cursor(conn)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          time TEXT NOT NULL,
          location TEXT NOT NULL,
          two_minute TEXT NOT NULL,
          why TEXT,
          habit_stack TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS checkins (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          habit_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          completed INTEGER NOT NULL,
          friction_note TEXT,
          redesigned INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS redesigns (
          id SERIAL PRIMARY KEY,
          habit_id INTEGER NOT NULL,
          trigger_reason TEXT,
          old_action TEXT, new_action TEXT,
          new_time TEXT, new_location TEXT, new_two_minute TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()
