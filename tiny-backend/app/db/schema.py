"""
Database schema for Tiny Habit Coach.
  - users: ID + timestamp
  - habits: Implementation Intention (action, time, location, two_minute) plus why + habit_stack from the onboarding conversation.
  - checkins: one row per day. completed=1 (YES) or 0 (NOT TODAY). friction_note captures WHY they missed. redesigned=1 means we changed the habit.
  - redesigns: Every time the AI suggests a habit change and the user accepts, we save the old vs new version here. This lets us track how many times the habit was redesigned and compare versions over time.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'db', 'tiny.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # rows behave like dicts: row['column_name']
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS habits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          time TEXT NOT NULL,
          location TEXT NOT NULL,
          two_minute TEXT NOT NULL,
          why TEXT,
          habit_stack TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS checkins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          habit_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          completed INTEGER NOT NULL,
          friction_note TEXT,
          redesigned INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS redesigns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          habit_id INTEGER NOT NULL,
          trigger_reason TEXT,
          old_action TEXT, new_action TEXT,
          new_time TEXT, new_location TEXT, new_two_minute TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.commit()
    conn.close()
