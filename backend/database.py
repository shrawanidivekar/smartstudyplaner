"""
Database layer for Smart Study Planner (SQLite, extensible to PostgreSQL)
Handles table schemas, connection pooling, and demo data seeding.
"""

import sqlite3
import os
import hashlib
import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "studyplanner.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def hash_password(password: str) -> str:
    salt = "smart_study_salt_2026"
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        course TEXT DEFAULT 'B.Tech Computer Science',
        semester TEXT DEFAULT 'Semester 6',
        college TEXT DEFAULT 'National Engineering College',
        daily_available_hours REAL DEFAULT 4.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        exam_date TEXT NOT NULL,
        difficulty INTEGER NOT NULL CHECK(difficulty BETWEEN 1 AND 5),
        total_chapters INTEGER NOT NULL DEFAULT 10,
        completed_chapters INTEGER NOT NULL DEFAULT 0,
        previous_marks REAL DEFAULT 60.0,
        confidence INTEGER DEFAULT 3 CHECK(confidence BETWEEN 1 AND 5),
        target_hours REAL DEFAULT 2.0,
        revision_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS StudyTasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER,
        topic TEXT NOT NULL,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        is_break INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS TestResults (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        topic TEXT NOT NULL,
        marks REAL NOT NULL,
        total_marks REAL NOT NULL DEFAULT 100.0,
        test_date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Revision (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        topic TEXT NOT NULL,
        last_revised TEXT NOT NULL,
        next_revision TEXT NOT NULL,
        revision_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS StudySessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject_id INTEGER,
        duration INTEGER NOT NULL, -- minutes
        date TEXT NOT NULL,
        session_type TEXT DEFAULT 'pomodoro',
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE SET NULL
    );
    """)

    conn.commit()
    conn.close()
    seed_demo_data()

def seed_subjects_for_user(conn, user_id: int):
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) as count FROM Subjects WHERE user_id = ?", (user_id,))
    if cursor.fetchone()["count"] > 0:
        return

    today = datetime.date.today()

    # Seed 5 Core Subjects with realistic exam dates relative to current date
    subjects_data = [
        ("Machine Learning", (today + datetime.timedelta(days=5)).isoformat(), 4, 10, 4, 54.0, 2, 2.0, 0),
        ("DBMS", (today + datetime.timedelta(days=12)).isoformat(), 3, 8, 6, 78.0, 4, 1.5, 2),
        ("Computer Networks", (today + datetime.timedelta(days=18)).isoformat(), 4, 9, 5, 62.0, 3, 1.5, 1),
        ("Software Engineering", (today + datetime.timedelta(days=26)).isoformat(), 2, 7, 6, 82.0, 4, 1.0, 2),
        ("VLSI Design", (today + datetime.timedelta(days=9)).isoformat(), 5, 8, 3, 48.0, 2, 2.0, 0),
    ]

    subject_ids = {}
    for name, exam_date, diff, total_ch, comp_ch, prev_marks, conf, tgt_hrs, rev_cnt in subjects_data:
        cursor.execute("""
            INSERT INTO Subjects (user_id, name, exam_date, difficulty, total_chapters, completed_chapters, previous_marks, confidence, target_hours, revision_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, name, exam_date, diff, total_ch, comp_ch, prev_marks, conf, tgt_hrs, rev_cnt))
        subject_ids[name] = cursor.lastrowid

    # Seed Realistic Test Results for Weak Topic Detection
    test_results_data = [
        ("Machine Learning", "K-Means Clustering", 85.0, 100.0, (today - datetime.timedelta(days=12)).isoformat()),
        ("Machine Learning", "Linear & Logistic Regression", 72.0, 100.0, (today - datetime.timedelta(days=9)).isoformat()),
        ("Machine Learning", "Principal Component Analysis", 45.0, 100.0, (today - datetime.timedelta(days=6)).isoformat()),
        ("Machine Learning", "Neural Networks & Backprop", 38.0, 100.0, (today - datetime.timedelta(days=2)).isoformat()),
        
        ("DBMS", "Relational Algebra", 88.0, 100.0, (today - datetime.timedelta(days=14)).isoformat()),
        ("DBMS", "Normalization & Normal Forms", 70.0, 100.0, (today - datetime.timedelta(days=7)).isoformat()),
        ("DBMS", "Indexing & B+ Trees", 52.0, 100.0, (today - datetime.timedelta(days=3)).isoformat()),
        
        ("Computer Networks", "OSI & TCP/IP Layering", 82.0, 100.0, (today - datetime.timedelta(days=15)).isoformat()),
        ("Computer Networks", "TCP Flow & Congestion Control", 76.0, 100.0, (today - datetime.timedelta(days=8)).isoformat()),
        ("Computer Networks", "Distance Vector & Link State Routing", 42.0, 100.0, (today - datetime.timedelta(days=4)).isoformat()),

        ("Software Engineering", "Agile & Scrum Methodology", 90.0, 100.0, (today - datetime.timedelta(days=11)).isoformat()),
        ("Software Engineering", "Design Patterns & UML", 84.0, 100.0, (today - datetime.timedelta(days=5)).isoformat()),

        ("VLSI Design", "Stick Diagrams & Layout", 75.0, 100.0, (today - datetime.timedelta(days=10)).isoformat()),
        ("VLSI Design", "CMOS Inverter Characteristics", 42.0, 100.0, (today - datetime.timedelta(days=4)).isoformat()),
        ("VLSI Design", "Dynamic CMOS Logic", 39.0, 100.0, (today - datetime.timedelta(days=1)).isoformat())
    ]

    for subj_name, topic, marks, total, t_date in test_results_data:
        s_id = subject_ids.get(subj_name)
        if s_id:
            cursor.execute("""
                INSERT INTO TestResults (user_id, subject_id, topic, marks, total_marks, test_date)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, s_id, topic, marks, total, t_date))

    # Seed Spaced Revisions
    revision_data = [
        ("Machine Learning", "Neural Networks & Backprop", (today - datetime.timedelta(days=5)).isoformat(), today.isoformat(), 0),
        ("Computer Networks", "Distance Vector & Link State Routing", (today - datetime.timedelta(days=4)).isoformat(), today.isoformat(), 0),
        ("VLSI Design", "Dynamic CMOS Logic", (today - datetime.timedelta(days=3)).isoformat(), (today + datetime.timedelta(days=1)).isoformat(), 1),
        ("DBMS", "Normalization & Normal Forms", (today - datetime.timedelta(days=1)).isoformat(), (today + datetime.timedelta(days=4)).isoformat(), 2),
        ("Machine Learning", "K-Means Clustering", (today - datetime.timedelta(days=2)).isoformat(), (today + datetime.timedelta(days=5)).isoformat(), 2),
    ]

    for subj_name, topic, last_rev, next_rev, r_count in revision_data:
        s_id = subject_ids.get(subj_name)
        if s_id:
            cursor.execute("""
                INSERT INTO Revision (user_id, subject_id, topic, last_revised, next_revision, revision_count)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, s_id, topic, last_rev, next_rev, r_count))

    # Seed Today's Study Tasks
    today_str = today.isoformat()
    tasks_data = [
        (subject_ids["Machine Learning"], "Principal Component Analysis (PCA)", today_str, "18:00", "18:50", 0, 0),
        (None, "Rest & Hydration Break", today_str, "18:50", "19:00", 0, 1),
        (subject_ids["DBMS"], "Normalization & 3NF / BCNF", today_str, "19:00", "19:45", 1, 0),
        (None, "Short Evening Break", today_str, "19:45", "19:55", 1, 1),
        (subject_ids["Computer Networks"], "Distance Vector Routing Protocols", today_str, "19:55", "20:40", 0, 0)
    ]

    for s_id, topic, d_str, st, et, comp, is_brk in tasks_data:
        cursor.execute("""
            INSERT INTO StudyTasks (user_id, subject_id, topic, date, start_time, end_time, completed, is_break)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, s_id, topic, d_str, st, et, comp, is_brk))

    # Seed Consecutive Study Sessions for Streak (Last 7 days)
    streak_minutes = [180, 210, 240, 150, 220, 270, 135] # ~2 to 4.5 hours each day
    for i, duration in enumerate(streak_minutes):
        session_date = (today - datetime.timedelta(days=(6 - i))).isoformat()
        cursor.execute("""
            INSERT INTO StudySessions (user_id, subject_id, duration, date, session_type)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, subject_ids["Machine Learning"] if i % 2 == 0 else subject_ids["DBMS"], duration, session_date, "study"))

    conn.commit()

def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM Users WHERE email = ?", ("student@college.edu",))
    existing_user = cursor.fetchone()
    
    if not existing_user:
        # Create Demo User
        pwd_hash = hash_password("student123")
        cursor.execute("""
            INSERT INTO Users (name, email, password_hash, course, semester, college, daily_available_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "Alex Sharma",
            "student@college.edu",
            pwd_hash,
            "B.Tech Computer Science & Engineering",
            "Semester 6",
            "National Institute of Technology",
            4.5
        ))
        user_id = cursor.lastrowid
        conn.commit()
    else:
        user_id = existing_user["id"]

    seed_subjects_for_user(conn, user_id)
    conn.close()
    print("[Database] Schema initialized and realistic demo data seeded successfully.")

if __name__ == "__main__":
    init_db()
