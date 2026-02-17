"""SQLite database setup."""
import sqlite3
from contextlib import contextmanager
from app.config import DB_PATH


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            focus TEXT DEFAULT '',
            energy_level INTEGER DEFAULT 7,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            time_slot TEXT DEFAULT '',
            duration_min INTEGER DEFAULT 30,
            priority INTEGER DEFAULT 2,
            is_completed INTEGER DEFAULT 0,
            is_ai_generated INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            completed_at TEXT,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            target_date TEXT,
            progress INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            frequency TEXT DEFAULT 'daily',
            streak INTEGER DEFAULT 0,
            best_streak INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS habit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
            UNIQUE(habit_id, date)
        );
        CREATE TABLE IF NOT EXISTS reflections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            wins TEXT DEFAULT '',
            lessons TEXT DEFAULT '',
            mood INTEGER DEFAULT 5,
            productivity_score INTEGER DEFAULT 5,
            notes TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_plan ON tasks(plan_id);
        CREATE INDEX IF NOT EXISTS idx_plans_date ON plans(date);
        CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

        -- Rituals
        CREATE TABLE IF NOT EXISTS rituals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'morning',
            description TEXT DEFAULT '',
            time_slot TEXT DEFAULT '',
            duration_min INTEGER DEFAULT 5,
            category TEXT DEFAULT '',
            icon TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            UNIQUE(name, type)
        );
        CREATE TABLE IF NOT EXISTS ritual_completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ritual_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            completed_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (ritual_id) REFERENCES rituals(id),
            UNIQUE(ritual_id, date)
        );

        -- Workouts
        CREATE TABLE IF NOT EXISTS workouts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            type TEXT,
            exercises TEXT DEFAULT '[]',
            duration_min INTEGER DEFAULT 60,
            intensity TEXT DEFAULT 'medium',
            notes TEXT DEFAULT '',
            completed INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        -- Meals
        CREATE TABLE IF NOT EXISTS meals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            meal_type TEXT,
            description TEXT,
            calories INTEGER DEFAULT 0,
            protein REAL DEFAULT 0,
            carbs REAL DEFAULT 0,
            fat REAL DEFAULT 0,
            time TEXT DEFAULT '',
            created_at TEXT DEFAULT (datetime('now'))
        );

        -- Supplements
        CREATE TABLE IF NOT EXISTS supplements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dosage TEXT DEFAULT '',
            time_of_day TEXT DEFAULT '',
            with_food INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS supplement_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplement_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            taken INTEGER DEFAULT 0,
            time TEXT DEFAULT '',
            FOREIGN KEY (supplement_id) REFERENCES supplements(id),
            UNIQUE(supplement_id, date)
        );

        -- Deep Work Sessions
        CREATE TABLE IF NOT EXISTS deepwork_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            task TEXT,
            category TEXT DEFAULT '',
            planned_duration INTEGER DEFAULT 90,
            actual_duration INTEGER DEFAULT 0,
            focus_score INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            started_at TEXT,
            ended_at TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        -- TM Progress
        CREATE TABLE IF NOT EXISTS tm_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            current_level INTEGER DEFAULT 0,
            level_name TEXT DEFAULT 'Sleep',
            xp_current INTEGER DEFAULT 0,
            xp_needed INTEGER DEFAULT 100,
            qualities_unlocked TEXT DEFAULT '[]',
            rituals_completed INTEGER DEFAULT 0,
            days_streak INTEGER DEFAULT 0,
            updated_at TEXT DEFAULT (datetime('now'))
        );

        -- Detox Sessions
        CREATE TABLE IF NOT EXISTS detox_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            start_time TEXT,
            end_time TEXT,
            duration_min INTEGER DEFAULT 0,
            success INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        -- Seed morning rituals
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Подъём', 'morning', '07:00', 5, 1);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Стакан воды', 'morning', '07:05', 2, 2);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Медитация 528Гц', 'morning', '07:10', 15, 3);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Холодный душ', 'morning', '07:25', 5, 4);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Завтрак', 'morning', '07:30', 20, 5);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Intention Setting', 'morning', '07:50', 5, 6);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Gratitude Journal', 'morning', '07:55', 10, 7);

        -- Seed evening rituals
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Digital Detox', 'evening', '21:00', 180, 1);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Reflection Journal', 'evening', '21:00', 15, 2);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Планирование завтра', 'evening', '21:15', 10, 3);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Дыхание 4-7-8', 'evening', '22:30', 10, 4);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Мелатонин', 'evening', '22:40', 1, 5);
        INSERT OR IGNORE INTO rituals (name, type, time_slot, duration_min, sort_order) VALUES ('Отбой', 'evening', '23:00', 0, 6);

        -- Seed TM progress default row
        INSERT OR IGNORE INTO tm_progress (id) VALUES (1);
    """)
    conn.close()


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
