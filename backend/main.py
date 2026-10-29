"""
Smart Study Planner – AI Based Student Study Assistant
FastAPI Backend Application
"""

import os
import sys
import datetime
import math
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

# Ensure project root is in sys.path so ml module can be imported
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.database import get_db_connection, init_db, hash_password, verify_password, seed_subjects_for_user
from ml.priority_model import priority_predictor
from ml.score_prediction import score_predictor

app = FastAPI(
    title="Smart Study Planner API",
    description="AI-Based Student Study Assistant Backend powered by Machine Learning",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# PYDANTIC SCHEMAS
# -------------------------------------------------------------
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    course: Optional[str] = "B.Tech Computer Science"
    semester: Optional[str] = "Semester 6"
    college: Optional[str] = "College of Engineering"
    daily_available_hours: Optional[float] = 4.0

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    college: Optional[str] = None
    daily_available_hours: Optional[float] = None

class SubjectCreate(BaseModel):
    name: str
    exam_date: str # YYYY-MM-DD
    difficulty: int = Field(..., ge=1, le=5)
    total_chapters: int = Field(..., ge=1)
    completed_chapters: int = Field(0, ge=0)
    previous_marks: float = Field(..., ge=0.0, le=100.0)
    confidence: int = Field(3, ge=1, le=5)
    target_hours: float = Field(2.0, ge=0.5, le=12.0)
    revision_count: int = Field(0, ge=0)

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    exam_date: Optional[str] = None
    difficulty: Optional[int] = Field(None, ge=1, le=5)
    total_chapters: Optional[int] = Field(None, ge=1)
    completed_chapters: Optional[int] = Field(None, ge=0)
    previous_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    confidence: Optional[int] = Field(None, ge=1, le=5)
    target_hours: Optional[float] = Field(None, ge=0.5, le=12.0)
    revision_count: Optional[int] = Field(None, ge=0)

class PriorityPredictRequest(BaseModel):
    days_remaining: int = Field(..., ge=0)
    syllabus_completion: float = Field(..., ge=0.0, le=100.0)
    difficulty: int = Field(..., ge=1, le=5)
    previous_marks: float = Field(..., ge=0.0, le=100.0)
    confidence_level: int = Field(3, ge=1, le=5)
    available_study_time: float = Field(3.0, ge=0.5, le=12.0)
    revision_count: int = Field(0, ge=0)

class ScorePredictRequest(BaseModel):
    daily_study_hours: float = Field(..., ge=0.5, le=12.0)
    syllabus_completion: float = Field(..., ge=0.0, le=100.0)
    previous_marks: float = Field(..., ge=0.0, le=100.0)
    revision_count: int = Field(0, ge=0)
    practice_test_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    days_remaining: int = Field(15, ge=1)
    difficulty: int = Field(3, ge=1, le=5)

class GeneratePlanRequest(BaseModel):
    date: Optional[str] = None # Defaults to today
    available_hours: float = Field(..., ge=1.0, le=14.0)
    start_time: str = Field("17:00", description="HH:MM format, 24h")
    break_duration: int = Field(10, ge=5, le=30, description="Break duration in minutes")

class TaskCreate(BaseModel):
    subject_id: Optional[int] = None
    topic: str
    date: str
    start_time: str
    end_time: str
    is_break: int = 0

class TaskUpdate(BaseModel):
    topic: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    date: Optional[str] = None
    completed: Optional[int] = None

class TestResultCreate(BaseModel):
    subject_id: int
    topic: str
    marks: float = Field(..., ge=0.0)
    total_marks: float = Field(100.0, gt=0.0)
    test_date: str

class RevisionCreate(BaseModel):
    subject_id: int
    topic: str
    last_revised: Optional[str] = None
    next_revision: Optional[str] = None

class PomodoroLog(BaseModel):
    subject_id: Optional[int] = None
    duration: int = Field(..., ge=1, le=180) # minutes
    session_type: str = "pomodoro"

# -------------------------------------------------------------
# AUTH HELPER
# -------------------------------------------------------------
def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """
    Extracts user ID from Authorization header: 'Bearer <user_id>' or defaults to demo user ID 1
    """
    if not authorization:
        # Default to student demo user
        return 1
    try:
        token = authorization.replace("Bearer ", "").strip()
        if token.isdigit():
            return int(token)
        # If token is in format user_<id>
        if token.startswith("user_"):
            return int(token.split("_")[1])
        return 1
    except Exception:
        return 1

# -------------------------------------------------------------
# STARTUP EVENT
# -------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    init_db()

# -------------------------------------------------------------
# AUTHENTICATION ROUTES
# -------------------------------------------------------------
@app.post("/api/auth/register")
def register(user: UserRegister):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Users WHERE email = ?", (user.email.strip().lower(),))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    pwd_hash = hash_password(user.password)
    cursor.execute("""
        INSERT INTO Users (name, email, password_hash, course, semester, college, daily_available_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user.name.strip(),
        user.email.strip().lower(),
        pwd_hash,
        user.course.strip(),
        user.semester.strip(),
        user.college.strip(),
        user.daily_available_hours
    ))
    new_user_id = cursor.lastrowid
    seed_subjects_for_user(conn, new_user_id)
    conn.commit()
    conn.close()

    return {
        "message": "Registration successful!",
        "token": str(new_user_id),
        "user": {
            "id": new_user_id,
            "name": user.name,
            "email": user.email,
            "course": user.course,
            "semester": user.semester,
            "college": user.college,
            "daily_available_hours": user.daily_available_hours
        }
    }

@app.post("/api/auth/login")
def login(creds: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users WHERE email = ?", (creds.email.strip().lower(),))
    user = cursor.fetchone()
    conn.close()

    if not user or not verify_password(creds.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "message": "Login successful!",
        "token": str(user["id"]),
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "course": user["course"],
            "semester": user["semester"],
            "college": user["college"],
            "daily_available_hours": user["daily_available_hours"]
        }
    }

@app.get("/api/auth/me")
def get_me(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, course, semester, college, daily_available_hours, created_at FROM Users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return dict(user)

@app.put("/api/auth/profile")
def update_profile(data: UserProfileUpdate, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    params = []
    if data.name is not None:
        updates.append("name = ?")
        params.append(data.name.strip())
    if data.course is not None:
        updates.append("course = ?")
        params.append(data.course.strip())
    if data.semester is not None:
        updates.append("semester = ?")
        params.append(data.semester.strip())
    if data.college is not None:
        updates.append("college = ?")
        params.append(data.college.strip())
    if data.daily_available_hours is not None:
        updates.append("daily_available_hours = ?")
        params.append(data.daily_available_hours)

    if updates:
        params.append(user_id)
        cursor.execute(f"UPDATE Users SET {', '.join(updates)} WHERE id = ?", tuple(params))
        conn.commit()

    cursor.execute("SELECT id, name, email, course, semester, college, daily_available_hours FROM Users WHERE id = ?", (user_id,))
    updated = cursor.fetchone()
    conn.close()
    return {"message": "Profile updated successfully!", "user": dict(updated)}

# -------------------------------------------------------------
# SUBJECT MANAGEMENT CRUD + ML PRIORITY AUGMENTATION
# -------------------------------------------------------------
def enrich_subject_with_ml(subj_dict: dict, user_daily_hours: float = 4.0) -> dict:
    today = datetime.date.today()
    try:
        exam_dt = datetime.date.fromisoformat(subj_dict["exam_date"])
        days_rem = max(0, (exam_dt - today).days)
    except Exception:
        days_rem = 14

    tot_ch = max(1, subj_dict["total_chapters"])
    comp_ch = min(tot_ch, max(0, subj_dict["completed_chapters"]))
    syllabus_pct = round((comp_ch / tot_ch) * 100.0, 1)

    ml_out = priority_predictor.predict(
        days_remaining=days_rem,
        syllabus_completion=syllabus_pct,
        difficulty=subj_dict["difficulty"],
        previous_marks=subj_dict["previous_marks"],
        confidence_level=subj_dict.get("confidence", 3),
        available_study_time=subj_dict.get("target_hours", 2.0),
        revision_count=subj_dict.get("revision_count", 0)
    )

    enriched = dict(subj_dict)
    enriched["days_remaining"] = days_rem
    enriched["syllabus_completion"] = syllabus_pct
    enriched["ml_priority"] = ml_out["priority"] # HIGH, MEDIUM, LOW
    enriched["ml_priority_score"] = ml_out["priority_score"] # 0 - 100
    enriched["ml_reasons"] = ml_out["reasons"]
    return enriched

@app.get("/api/subjects")
def get_subjects(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT daily_available_hours FROM Users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    user_hours = user_row["daily_available_hours"] if user_row else 4.0

    cursor.execute("SELECT * FROM Subjects WHERE user_id = ? ORDER BY exam_date ASC", (user_id,))
    rows = cursor.fetchall()
    conn.close()

    result = [enrich_subject_with_ml(dict(r), user_hours) for r in rows]
    # Sort primarily by ML priority score descending
    result.sort(key=lambda s: s["ml_priority_score"], reverse=True)
    return result

@app.post("/api/subjects")
def add_subject(sub: SubjectCreate, user_id: int = Depends(get_current_user_id)):
    if sub.completed_chapters > sub.total_chapters:
        raise HTTPException(status_code=400, detail="Completed chapters cannot exceed total chapters.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Subjects (user_id, name, exam_date, difficulty, total_chapters, completed_chapters, previous_marks, confidence, target_hours, revision_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        sub.name.strip(),
        sub.exam_date,
        sub.difficulty,
        sub.total_chapters,
        sub.completed_chapters,
        sub.previous_marks,
        sub.confidence,
        sub.target_hours,
        sub.revision_count
    ))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM Subjects WHERE id = ?", (new_id,))
    inserted = cursor.fetchone()
    conn.close()

    enriched = enrich_subject_with_ml(dict(inserted))
    return {"message": "Subject created successfully!", "subject": enriched}

@app.put("/api/subjects/{subject_id}")
def update_subject(subject_id: int, sub: SubjectUpdate, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Subjects WHERE id = ? AND user_id = ?", (subject_id, user_id))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Subject not found.")

    updates = []
    params = []
    for field, val in sub.dict(exclude_unset=True).items():
        if val is not None:
            updates.append(f"{field} = ?")
            params.append(val)

    if updates:
        params.extend([subject_id, user_id])
        cursor.execute(f"UPDATE Subjects SET {', '.join(updates)} WHERE id = ? AND user_id = ?", tuple(params))
        conn.commit()

    cursor.execute("SELECT * FROM Subjects WHERE id = ?", (subject_id,))
    updated = cursor.fetchone()
    conn.close()

    enriched = enrich_subject_with_ml(dict(updated))
    return {"message": "Subject updated successfully!", "subject": enriched}

@app.delete("/api/subjects/{subject_id}")
def delete_subject(subject_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Subjects WHERE id = ? AND user_id = ?", (subject_id, user_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Subject not found.")
    return {"message": "Subject deleted successfully."}

@app.get("/api/subjects/{subject_id}")
def get_subject_detail(subject_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Subjects WHERE id = ? AND user_id = ?", (subject_id, user_id))
    subj = cursor.fetchone()
    if not subj:
        conn.close()
        raise HTTPException(status_code=404, detail="Subject not found.")

    cursor.execute("SELECT * FROM TestResults WHERE subject_id = ? ORDER BY test_date DESC", (subject_id,))
    tests = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM Revision WHERE subject_id = ? ORDER BY next_revision ASC", (subject_id,))
    revisions = [dict(r) for r in cursor.fetchall()]

    conn.close()
    enriched = enrich_subject_with_ml(dict(subj))
    enriched["test_results"] = tests
    enriched["revisions"] = revisions
    return enriched

# -------------------------------------------------------------
# ML PREDICTION ENDPOINTS
# -------------------------------------------------------------
@app.post("/api/predict-priority")
def predict_priority_endpoint(payload: PriorityPredictRequest):
    return priority_predictor.predict(
        days_remaining=payload.days_remaining,
        syllabus_completion=payload.syllabus_completion,
        difficulty=payload.difficulty,
        previous_marks=payload.previous_marks,
        confidence_level=payload.confidence_level,
        available_study_time=payload.available_study_time,
        revision_count=payload.revision_count
    )

@app.post("/api/predict-score")
def predict_score_endpoint(payload: ScorePredictRequest):
    return score_predictor.predict(
        daily_study_hours=payload.daily_study_hours,
        syllabus_completion=payload.syllabus_completion,
        previous_marks=payload.previous_marks,
        revision_count=payload.revision_count,
        practice_test_score=payload.practice_test_score,
        days_remaining=payload.days_remaining,
        difficulty=payload.difficulty
    )

# -------------------------------------------------------------
# MAIN DASHBOARD CONSOLIDATED ENDPOINT
# -------------------------------------------------------------
@app.get("/api/dashboard")
def get_dashboard(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()

    today = datetime.date.today()
    today_str = today.isoformat()

    # User info
    cursor.execute("SELECT daily_available_hours FROM Users WHERE id = ?", (user_id,))
    user_row = cursor.fetchone()
    user_hours = user_row["daily_available_hours"] if user_row else 4.0

    # Subjects
    cursor.execute("SELECT * FROM Subjects WHERE user_id = ? ORDER BY exam_date ASC", (user_id,))
    raw_subjects = [dict(r) for r in cursor.fetchall()]
    subjects = [enrich_subject_with_ml(s, user_hours) for s in raw_subjects]
    subjects.sort(key=lambda s: s["ml_priority_score"], reverse=True)

    # Summary 1: Exams Remaining
    upcoming_exams = [s for s in subjects if s["days_remaining"] >= 0]
    exams_remaining_count = len(upcoming_exams)

    # Summary 2: Average Syllabus Completed %
    if subjects:
        avg_syllabus = round(sum(s["syllabus_completion"] for s in subjects) / len(subjects), 1)
    else:
        avg_syllabus = 0.0

    # Summary 3: Today's Study Hours (Logged in StudySessions today)
    cursor.execute("SELECT sum(duration) as total_min FROM StudySessions WHERE user_id = ? AND date = ?", (user_id, today_str))
    res_min = cursor.fetchone()["total_min"] or 0
    today_hours = round(res_min / 60.0, 1)

    # Summary 4: Current Study Streak
    # Calculate streak by checking consecutive days backwards from today
    streak = 0
    check_date = today
    for _ in range(60):
        c_str = check_date.isoformat()
        cursor.execute("SELECT count(*) as cnt FROM StudySessions WHERE user_id = ? AND date = ?", (user_id, c_str))
        cnt = cursor.fetchone()["cnt"]
        if cnt > 0:
            streak += 1
            check_date -= datetime.timedelta(days=1)
        else:
            # If today has not been logged yet, allow streak from yesterday
            if check_date == today:
                check_date -= datetime.timedelta(days=1)
                continue
            break

    # Summary 5: Average Test Performance
    cursor.execute("SELECT marks, total_marks FROM TestResults WHERE user_id = ?", (user_id,))
    all_tests = cursor.fetchall()
    if all_tests:
        percentages = [(t["marks"] / max(1.0, t["total_marks"])) * 100.0 for t in all_tests]
        avg_performance = round(sum(percentages) / len(percentages), 1)
    else:
        avg_performance = 72.0

    # Today's Recommendation: "🎯 What should I study now?"
    # Find subject with highest priority score, lowest completion or weakest topic
    cursor.execute("""
        SELECT tr.topic, tr.marks, tr.total_marks, s.name as subject_name, s.id as subject_id
        FROM TestResults tr
        JOIN Subjects s ON tr.subject_id = s.id
        WHERE tr.user_id = ? AND (tr.marks / tr.total_marks) < 0.60
        ORDER BY (tr.marks / tr.total_marks) ASC LIMIT 1
    """, (user_id,))
    weak_test = cursor.fetchone()

    top_subject = subjects[0] if subjects else None
    if top_subject:
        rec_topic = weak_test["topic"] if (weak_test and weak_test["subject_id"] == top_subject["id"]) else f"High Yield Review: Chapters 1-{top_subject['completed_chapters'] + 1}"
        
        # Reasons list
        reasons = []
        if top_subject["days_remaining"] <= 7:
            reasons.append(f"Exam is near ({top_subject['days_remaining']} days remaining)")
        else:
            reasons.append(f"Next exam in {top_subject['days_remaining']} days")

        if top_subject["syllabus_completion"] < 60:
            reasons.append(f"Topic completion is low ({top_subject['syllabus_completion']}% covered)")
        
        if top_subject["previous_marks"] < 65:
            reasons.append(f"Previous performance ({top_subject['previous_marks']}%) requires improvement")
        else:
            reasons.append(f"High priority score ({top_subject['ml_priority_score']}/100)")

        recommendation = {
            "subject_id": top_subject["id"],
            "subject": top_subject["name"],
            "topic": rec_topic,
            "recommended_time": 45,
            "priority": top_subject["ml_priority"],
            "reasons": reasons
        }
    else:
        recommendation = {
            "subject_id": None,
            "subject": "Add your subjects",
            "topic": "Getting Started",
            "recommended_time": 30,
            "priority": "LOW",
            "reasons": ["Add subjects in the Subjects tab to get personalized recommendations."]
        }

    # In-App Reminders / Notifications
    notifications = []
    # 1. Exams in <= 7 days
    for s in upcoming_exams:
        if s["days_remaining"] <= 7:
            notifications.append({
                "type": "exam",
                "badge": "URGENT",
                "title": f"Upcoming Exam: {s['name']}",
                "message": f"Only {s['days_remaining']} days left. Priority is {s['ml_priority']} ({s['ml_priority_score']}/100)."
            })

    # 2. Revisions due today or overdue
    cursor.execute("""
        SELECT r.topic, s.name as subject_name, r.next_revision
        FROM Revision r
        JOIN Subjects s ON r.subject_id = s.id
        WHERE r.user_id = ? AND r.next_revision <= ?
    """, (user_id, today_str))
    rev_due = cursor.fetchall()
    for r in rev_due:
        notifications.append({
            "type": "revision",
            "badge": "REVISION DUE",
            "title": f"Spaced Revision: {r['topic']}",
            "message": f"{r['subject_name']} topic is due for review to prevent memory decay."
        })

    # 3. Uncompleted study tasks today
    cursor.execute("""
        SELECT count(*) as uncompleted FROM StudyTasks
        WHERE user_id = ? AND date = ? AND completed = 0 AND is_break = 0
    """, (user_id, today_str))
    uncompleted_tasks_cnt = cursor.fetchone()["uncompleted"]
    if uncompleted_tasks_cnt > 0:
        notifications.append({
            "type": "task",
            "badge": "PENDING",
            "title": f"{uncompleted_tasks_cnt} Study Tasks Remaining",
            "message": "You still have scheduled study blocks for today. Complete them to maintain your streak!"
        })

    conn.close()

    return {
        "summary": {
            "exams_remaining": exams_remaining_count,
            "syllabus_completed_pct": avg_syllabus,
            "today_study_hours": today_hours,
            "target_study_hours": user_hours,
            "current_streak_days": streak,
            "average_performance": avg_performance
        },
        "today_recommendation": recommendation,
        "priority_subjects": subjects,
        "notifications": notifications
    }

# -------------------------------------------------------------
# SMART STUDY PLANNER (TIMETABLE GENERATOR & CRUD)
# -------------------------------------------------------------
@app.get("/api/study-plan")
def get_study_plan(date: Optional[str] = None, user_id: int = Depends(get_current_user_id)):
    if not date:
        date = datetime.date.today().isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, s.name as subject_name, s.difficulty
        FROM StudyTasks t
        LEFT JOIN Subjects s ON t.subject_id = s.id
        WHERE t.user_id = ? AND t.date = ?
        ORDER BY t.start_time ASC
    """, (user_id, date))
    tasks = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return tasks

@app.post("/api/study-plan")
def generate_study_plan(req: GeneratePlanRequest, user_id: int = Depends(get_current_user_id)):
    """
    Intelligently generates a study timetable based on ML subject priority scores and weak topics.
    Calculates time blocks, study durations, and interleaved rest breaks.
    """
    plan_date = req.date or datetime.date.today().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM Subjects WHERE user_id = ?", (user_id,))
    raw_subjects = [dict(r) for r in cursor.fetchall()]
    if not raw_subjects:
        seed_subjects_for_user(conn, user_id)
        cursor.execute("SELECT * FROM Subjects WHERE user_id = ?", (user_id,))
        raw_subjects = [dict(r) for r in cursor.fetchall()]

    enriched_subjects = [enrich_subject_with_ml(s) for s in raw_subjects]
    # Sort by priority score descending
    enriched_subjects.sort(key=lambda s: s["ml_priority_score"], reverse=True)

    # Fetch weak topics for each subject to assign meaningful topic names
    cursor.execute("""
        SELECT subject_id, topic, (marks / total_marks) as score_ratio
        FROM TestResults WHERE user_id = ?
        ORDER BY score_ratio ASC
    """, (user_id,))
    test_rows = cursor.fetchall()
    weakest_topics = {}
    for tr in test_rows:
        s_id = tr["subject_id"]
        if s_id not in weakest_topics:
            weakest_topics[s_id] = tr["topic"]

    # Delete existing tasks for that date if student is regenerating
    cursor.execute("DELETE FROM StudyTasks WHERE user_id = ? AND date = ?", (user_id, plan_date))

    # Parse start time
    try:
        sh, sm = map(int, req.start_time.split(":"))
        curr_time = datetime.datetime.combine(datetime.date.fromisoformat(plan_date), datetime.time(sh, sm))
    except Exception:
        curr_time = datetime.datetime.combine(datetime.date.fromisoformat(plan_date), datetime.time(17, 0))

    total_available_minutes = int(req.available_hours * 60)
    
    # Select top 3 or 4 subjects based on available time
    num_subjects_to_schedule = min(len(enriched_subjects), max(2, int(req.available_hours / 1.2)))
    selected_subjects = enriched_subjects[:num_subjects_to_schedule]

    # Calculate weights based on priority scores
    total_priority = sum(max(10.0, s["ml_priority_score"]) for s in selected_subjects)
    
    # Deduct estimated break minutes
    total_breaks_minutes = (len(selected_subjects) - 1) * req.break_duration
    study_minutes_pool = max(30, total_available_minutes - total_breaks_minutes)

    created_tasks = []
    for i, subj in enumerate(selected_subjects):
        weight = max(10.0, subj["ml_priority_score"]) / total_priority
        subj_study_mins = int(study_minutes_pool * weight)
        # Clamp session between 35 and 65 mins for optimal retention
        subj_study_mins = max(30, min(65, subj_study_mins))

        end_time = curr_time + datetime.timedelta(minutes=subj_study_mins)

        # Topic selection
        topic_name = weakest_topics.get(subj["id"])
        if not topic_name:
            topic_name = f"Chapter {subj['completed_chapters'] + 1} & Core Formulae"

        cursor.execute("""
            INSERT INTO StudyTasks (user_id, subject_id, topic, date, start_time, end_time, completed, is_break)
            VALUES (?, ?, ?, ?, ?, ?, 0, 0)
        """, (
            user_id,
            subj["id"],
            f"{subj['name']} – {topic_name}",
            plan_date,
            curr_time.strftime("%H:%M"),
            end_time.strftime("%H:%M")
        ))
        created_tasks.append({
            "subject_name": subj["name"],
            "topic": f"{subj['name']} – {topic_name}",
            "start_time": curr_time.strftime("%H:%M"),
            "end_time": end_time.strftime("%H:%M"),
            "is_break": 0
        })

        curr_time = end_time

        # Add break if not the last subject
        if i < len(selected_subjects) - 1:
            break_end = curr_time + datetime.timedelta(minutes=req.break_duration)
            cursor.execute("""
                INSERT INTO StudyTasks (user_id, subject_id, topic, date, start_time, end_time, completed, is_break)
                VALUES (?, NULL, ?, ?, ?, ?, 0, 1)
            """, (
                user_id,
                "Rest & Refreshment Break",
                plan_date,
                curr_time.strftime("%H:%M"),
                break_end.strftime("%H:%M")
            ))
            curr_time = break_end

    conn.commit()
    conn.close()

    return {"message": "Smart timetable generated successfully!", "tasks_count": len(created_tasks)}

@app.patch("/api/study-plan/tasks/{task_id}/toggle")
def toggle_task(task_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM StudyTasks WHERE id = ? AND user_id = ?", (task_id, user_id))
    task = cursor.fetchone()
    if not task:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found.")

    new_status = 0 if task["completed"] == 1 else 1
    cursor.execute("UPDATE StudyTasks SET completed = ? WHERE id = ?", (new_status, task_id))

    # If completed and was not a break, log to StudySessions to count towards daily study and streak
    if new_status == 1 and not task["is_break"]:
        try:
            t1 = datetime.datetime.strptime(task["start_time"], "%H:%M")
            t2 = datetime.datetime.strptime(task["end_time"], "%H:%M")
            duration_mins = max(15, int((t2 - t1).total_seconds() / 60))
        except Exception:
            duration_mins = 45

        cursor.execute("""
            INSERT INTO StudySessions (user_id, subject_id, duration, date, session_type)
            VALUES (?, ?, ?, ?, 'task_completed')
        """, (user_id, task["subject_id"], duration_mins, task["date"]))

    conn.commit()
    conn.close()
    return {"message": "Task status updated.", "completed": new_status}

@app.put("/api/study-plan/tasks/{task_id}")
def update_task(task_id: int, data: TaskUpdate, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    updates = []
    params = []
    for k, v in data.dict(exclude_unset=True).items():
        if v is not None:
            updates.append(f"{k} = ?")
            params.append(v)
    if not updates:
        conn.close()
        return {"message": "No changes made."}

    params.extend([task_id, user_id])
    cursor.execute(f"UPDATE StudyTasks SET {', '.join(updates)} WHERE id = ? AND user_id = ?", tuple(params))
    conn.commit()
    conn.close()
    return {"message": "Task updated successfully."}

@app.delete("/api/study-plan/tasks/{task_id}")
def delete_task(task_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM StudyTasks WHERE id = ? AND user_id = ?", (task_id, user_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found.")
    return {"message": "Task deleted successfully."}

# -------------------------------------------------------------
# WEAK TOPIC DETECTION & PERFORMANCE MODULE
# -------------------------------------------------------------
@app.get("/api/performance")
def get_performance(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT tr.*, s.name as subject_name
        FROM TestResults tr
        JOIN Subjects s ON tr.subject_id = s.id
        WHERE tr.user_id = ?
        ORDER BY tr.test_date DESC
    """, (user_id,))
    tests = [dict(r) for r in cursor.fetchall()]

    # Group by subject and calculate topic percentages
    subjects_dict = {}
    weak_topics_list = []

    for t in tests:
        s_id = t["subject_id"]
        s_name = t["subject_name"]
        pct = round((t["marks"] / max(1.0, t["total_marks"])) * 100.0, 1)
        
        # Categorize
        if pct < 50.0:
            status_tag = "WEAK"
            icon = "❌"
            rec = f"Allocate an extra 45-60 min review and practice 10 numerical/mcq problems."
        elif pct <= 72.0:
            status_tag = "AVERAGE"
            icon = "⚠️"
            rec = f"Do quick flashcard revision to solidify key principles."
        else:
            status_tag = "STRONG"
            icon = "✅"
            rec = f"Well mastered. Maintain spaced recall every 7-10 days."

        topic_entry = {
            "id": t["id"],
            "subject_id": s_id,
            "subject_name": s_name,
            "topic": t["topic"],
            "marks": t["marks"],
            "total_marks": t["total_marks"],
            "percentage": pct,
            "status": status_tag,
            "icon": icon,
            "test_date": t["test_date"],
            "recommendation": rec
        }

        if s_name not in subjects_dict:
            subjects_dict[s_name] = {
                "subject_name": s_name,
                "subject_id": s_id,
                "topics": [],
                "avg_percentage": 0.0
            }
        subjects_dict[s_name]["topics"].append(topic_entry)
        weak_topics_list.append(topic_entry)

    # Calculate subject averages
    for s_name, data in subjects_dict.items():
        if data["topics"]:
            data["avg_percentage"] = round(sum(t["percentage"] for t in data["topics"]) / len(data["topics"]), 1)

    # Sort weak topics from lowest score to highest
    weak_topics_list.sort(key=lambda t: t["percentage"])

    weakest_topic_overall = weak_topics_list[0] if weak_topics_list else None

    conn.close()

    return {
        "subjects_breakdown": list(subjects_dict.values()),
        "all_tests": tests,
        "weak_topics": weak_topics_list,
        "weakest_topic": weakest_topic_overall,
        "summary": {
            "total_tests": len(tests),
            "weak_count": len([t for t in weak_topics_list if t["status"] == "WEAK"]),
            "average_count": len([t for t in weak_topics_list if t["status"] == "AVERAGE"]),
            "strong_count": len([t for t in weak_topics_list if t["status"] == "STRONG"])
        }
    }

@app.post("/api/performance")
def add_test_result(test: TestResultCreate, user_id: int = Depends(get_current_user_id)):
    if test.marks > test.total_marks:
        raise HTTPException(status_code=400, detail="Marks obtained cannot exceed total marks.")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO TestResults (user_id, subject_id, topic, marks, total_marks, test_date)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (user_id, test.subject_id, test.topic.strip(), test.marks, test.total_marks, test.test_date))
    new_id = cursor.lastrowid

    # If score is low (< 55%), automatically register a spaced revision entry for this topic
    pct = (test.marks / test.total_marks) * 100.0
    if pct < 55.0:
        today_str = datetime.date.today().isoformat()
        cursor.execute("SELECT id FROM Revision WHERE user_id = ? AND subject_id = ? AND topic = ?",
                       (user_id, test.subject_id, test.topic.strip()))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO Revision (user_id, subject_id, topic, last_revised, next_revision, revision_count)
                VALUES (?, ?, ?, ?, ?, 0)
            """, (user_id, test.subject_id, test.topic.strip(), today_str, today_str))

    conn.commit()
    conn.close()
    return {"message": "Test result recorded successfully!", "id": new_id}

@app.delete("/api/performance/{test_id}")
def delete_test_result(test_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM TestResults WHERE id = ? AND user_id = ?", (test_id, user_id))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    if not deleted:
        raise HTTPException(status_code=404, detail="Test record not found.")
    return {"message": "Test result removed."}

# -------------------------------------------------------------
# SPACED REVISION SYSTEM
# -------------------------------------------------------------
@app.get("/api/revision")
def get_revisions(user_id: int = Depends(get_current_user_id)):
    today = datetime.date.today()
    today_str = today.isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT r.*, s.name as subject_name
        FROM Revision r
        JOIN Subjects s ON r.subject_id = s.id
        WHERE r.user_id = ?
        ORDER BY r.next_revision ASC
    """, (user_id,))
    rows = cursor.fetchall()
    conn.close()

    categorized = {
        "due": [],      # 🔴 Revision Due (next_revision <= today)
        "soon": [],     # 🟡 Revision Soon (next_revision in next 1 to 3 days)
        "recent": []    # 🟢 Recently Revised (next_revision > 3 days)
    }

    for row in rows:
        item = dict(row)
        try:
            nxt_dt = datetime.date.fromisoformat(item["next_revision"])
            diff_days = (nxt_dt - today).days
        except Exception:
            diff_days = 0

        item["days_until_next"] = diff_days

        if diff_days <= 0:
            item["status_label"] = "Revision Due"
            item["badge_color"] = "red"
            categorized["due"].append(item)
        elif diff_days <= 3:
            item["status_label"] = "Revision Soon"
            item["badge_color"] = "yellow"
            categorized["soon"].append(item)
        else:
            item["status_label"] = "Recently Revised"
            item["badge_color"] = "green"
            categorized["recent"].append(item)

    return categorized

@app.post("/api/revision")
def add_revision(data: RevisionCreate, user_id: int = Depends(get_current_user_id)):
    today = datetime.date.today()
    last_rev = data.last_revised or today.isoformat()
    next_rev = data.next_revision or (today + datetime.timedelta(days=2)).isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO Revision (user_id, subject_id, topic, last_revised, next_revision, revision_count)
        VALUES (?, ?, ?, ?, ?, 0)
    """, (user_id, data.subject_id, data.topic.strip(), last_rev, next_rev))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"message": "Revision schedule created!", "id": new_id}

@app.post("/api/revision/{revision_id}/mark-revised")
def mark_topic_revised(revision_id: int, user_id: int = Depends(get_current_user_id)):
    """
    Spaced Repetition Algorithm:
    revision_count = 0 -> next revision in +2 days
    revision_count = 1 -> next revision in +4 days
    revision_count = 2 -> next revision in +7 days
    revision_count >= 3 -> next revision in +14 days
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Revision WHERE id = ? AND user_id = ?", (revision_id, user_id))
    rev = cursor.fetchone()
    if not rev:
        conn.close()
        raise HTTPException(status_code=404, detail="Revision entry not found.")

    new_count = rev["revision_count"] + 1
    today = datetime.date.today()
    today_str = today.isoformat()

    intervals = {1: 2, 2: 4, 3: 7}
    days_to_add = intervals.get(new_count, 14)
    next_date = (today + datetime.timedelta(days=days_to_add)).isoformat()

    cursor.execute("""
        UPDATE Revision
        SET last_revised = ?, next_revision = ?, revision_count = ?
        WHERE id = ?
    """, (today_str, next_date, new_count, revision_id))

    # Also increment the subject's revision_count
    cursor.execute("""
        UPDATE Subjects
        SET revision_count = revision_count + 1
        WHERE id = ?
    """, (rev["subject_id"],))

    # Log 30 min revision session
    cursor.execute("""
        INSERT INTO StudySessions (user_id, subject_id, duration, date, session_type)
        VALUES (?, ?, 30, ?, 'revision')
    """, (user_id, rev["subject_id"], today_str))

    conn.commit()
    conn.close()

    return {
        "message": f"Great job! Next spaced revision scheduled in {days_to_add} days ({next_date}).",
        "revision_count": new_count,
        "next_revision": next_date
    }

@app.delete("/api/revision/{revision_id}")
def delete_revision(revision_id: int, user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM Revision WHERE id = ? AND user_id = ?", (revision_id, user_id))
    conn.commit()
    conn.close()
    return {"message": "Revision deleted."}

# -------------------------------------------------------------
# POMODORO TIMER & STUDY LOGS
# -------------------------------------------------------------
@app.post("/api/pomodoro/log")
def log_pomodoro(session: PomodoroLog, user_id: int = Depends(get_current_user_id)):
    today_str = datetime.date.today().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO StudySessions (user_id, subject_id, duration, date, session_type)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, session.subject_id, session.duration, today_str, session.session_type))
    conn.commit()
    conn.close()
    return {"message": f"Logged {session.duration} minutes study session! Keep up the focus."}

@app.get("/api/pomodoro/stats")
def get_pomodoro_stats(user_id: int = Depends(get_current_user_id)):
    today_str = datetime.date.today().isoformat()
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT count(*) as count, coalesce(sum(duration), 0) as total_min
        FROM StudySessions
        WHERE user_id = ? AND date = ?
    """, (user_id, today_str))
    today_stats = cursor.fetchone()

    cursor.execute("""
        SELECT count(*) as count, coalesce(sum(duration), 0) as total_min
        FROM StudySessions
        WHERE user_id = ?
    """, (user_id,))
    all_time = cursor.fetchone()

    conn.close()
    return {
        "today_sessions": today_stats["count"],
        "today_minutes": today_stats["total_min"],
        "today_hours": round(today_stats["total_min"] / 60.0, 1),
        "total_sessions": all_time["count"],
        "total_minutes": all_time["total_min"]
    }

# -------------------------------------------------------------
# PROGRESS DASHBOARD CHARTS
# -------------------------------------------------------------
@app.get("/api/progress-charts")
def get_progress_charts(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Chart 1: Syllabus completion by subject
    cursor.execute("SELECT id, name, total_chapters, completed_chapters, difficulty, previous_marks FROM Subjects WHERE user_id = ?", (user_id,))
    subjects_rows = cursor.fetchall()

    syllabus_chart = []
    priority_chart_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    test_performance_chart = []

    for s in subjects_rows:
        tot = max(1, s["total_chapters"])
        comp = s["completed_chapters"]
        pct = round((comp / tot) * 100.0, 1)
        syllabus_chart.append({
            "subject": s["name"],
            "completion": pct,
            "total_chapters": tot,
            "completed_chapters": comp
        })

        # Calculate priority for chart
        enriched = enrich_subject_with_ml(dict(s))
        p = enriched["ml_priority"]
        if p in priority_chart_counts:
            priority_chart_counts[p] += 1

    # Chart 2: Daily Study Hours over past 7 days
    today = datetime.date.today()
    daily_hours_chart = []
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        d_str = d.isoformat()
        cursor.execute("SELECT coalesce(sum(duration), 0) as mins FROM StudySessions WHERE user_id = ? AND date = ?", (user_id, d_str))
        mins = cursor.fetchone()["mins"]
        daily_hours_chart.append({
            "date": d.strftime("%b %d"),
            "full_date": d_str,
            "hours": round(mins / 60.0, 1),
            "minutes": mins
        })

    # Chart 3: Test Performance by Subject
    for s in subjects_rows:
        cursor.execute("SELECT avg(marks * 100.0 / total_marks) as avg_test FROM TestResults WHERE subject_id = ?", (s["id"],))
        avg_res = cursor.fetchone()["avg_test"]
        avg_score = round(avg_res, 1) if avg_res is not None else s["previous_marks"]
        test_performance_chart.append({
            "subject": s["name"],
            "average_score": avg_score
        })

    conn.close()

    # Chart 4: Subject Priority counts
    priority_distribution = [
        {"name": "High Priority", "priority": "HIGH", "count": priority_chart_counts["HIGH"], "color": "#ef4444"},
        {"name": "Medium Priority", "priority": "MEDIUM", "count": priority_chart_counts["MEDIUM"], "color": "#f59e0b"},
        {"name": "Low Priority", "priority": "LOW", "count": priority_chart_counts["LOW"], "color": "#10b981"}
    ]

    return {
        "syllabus_by_subject": syllabus_chart,
        "daily_study_hours": daily_hours_chart,
        "test_performance": test_performance_chart,
        "priority_distribution": priority_distribution
    }

# -------------------------------------------------------------
# CALENDAR ENDPOINT
# -------------------------------------------------------------
@app.get("/api/calendar")
def get_calendar_events(user_id: int = Depends(get_current_user_id)):
    conn = get_db_connection()
    cursor = conn.cursor()

    events_by_date: Dict[str, List[Any]] = {}

    def add_event(date_str, item):
        if not date_str:
            return
        if date_str not in events_by_date:
            events_by_date[date_str] = []
        events_by_date[date_str].append(item)

    # 1. Exams
    cursor.execute("SELECT id, name, exam_date, difficulty FROM Subjects WHERE user_id = ?", (user_id,))
    for sub in cursor.fetchall():
        add_event(sub["exam_date"], {
            "type": "exam",
            "title": f"Exam: {sub['name']}",
            "description": f"Difficulty: {sub['difficulty']}/5",
            "badge": "EXAM",
            "color": "red"
        })

    # 2. Study Tasks
    cursor.execute("""
        SELECT t.*, s.name as subject_name
        FROM StudyTasks t
        LEFT JOIN Subjects s ON t.subject_id = s.id
        WHERE t.user_id = ?
    """, (user_id,))
    for t in cursor.fetchall():
        add_event(t["date"], {
            "type": "task",
            "title": t["topic"],
            "description": f"{t['start_time']} - {t['end_time']}",
            "completed": bool(t["completed"]),
            "badge": "STUDY TASK" if not t["is_break"] else "BREAK",
            "color": "blue" if not t["is_break"] else "gray"
        })

    # 3. Revision Due Dates
    cursor.execute("""
        SELECT r.*, s.name as subject_name
        FROM Revision r
        JOIN Subjects s ON r.subject_id = s.id
        WHERE r.user_id = ?
    """, (user_id,))
    for r in cursor.fetchall():
        add_event(r["next_revision"], {
            "type": "revision",
            "title": f"Revise: {r['topic']}",
            "description": f"Subject: {r['subject_name']} (Rev #{r['revision_count']})",
            "badge": "REVISION",
            "color": "yellow"
        })

    conn.close()
    return events_by_date

# -------------------------------------------------------------
# STATIC FRONTEND SERVING (For All-In-One Render Web Service)
# -------------------------------------------------------------
FRONTEND_DIST = os.path.join(PROJECT_ROOT, "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend build index.html not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
