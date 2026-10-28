# Smart Study Planner – AI Based Student Study Assistant

An interactive, Machine Learning-driven web application designed to help college students optimize study schedules, prioritize subjects, detect conceptual weak areas, predict exam scores, and maintain a consistent daily study streak.

---

## 🌟 Key Features

1. **Academic Dashboard**
   - **5 Summary Cards**: Exams Remaining, Syllabus Completed %, Today's Study Hours, Current Study Streak (days), Average Quiz Performance.
   - **🎯 "What should I study now?"**: Real-time AI recommendation banner with a 1-click **"Study Now"** button that automatically preloads the focus topic into the Pomodoro timer.
   - **ML Ranked Priority Subjects**: Displays subjects categorized by urgency and difficulty with color-coded badges (🔴 HIGH, 🟡 MEDIUM, 🟢 LOW) and numerical scores (0–100).
   - **In-App Reminders & Notifications**: Alerts for exams in $\le 7$ days, overdue spaced revisions, and pending study tasks.

2. **Subject Management (CRUD)**
   - Add, edit, delete, and view subject details.
   - Fields: Subject name, exam date, difficulty (1-5), total chapters, completed chapters, previous marks (%), confidence level (1-5), daily target hours, revision count.
   - Automatic calculation of syllabus completion % and real-time ML priority scores.

3. **ML Subject Priority Prediction (Classification + Scoring)**
   - **Algorithm**: Random Forest Classifier + Gradient Boosting Regressor trained on 1,500 realistic student academic records.
   - Evaluates: Days remaining until exam, syllabus gap, subject difficulty, past marks, self-confidence, available study time, and revision count.
   - Provides **Explainable AI (XAI)** reasoning detailing exactly why a subject received its assigned priority.

4. **Smart Daily Study Planner**
   - Automatically generates a balanced, personalized timetable based on ML priority scores.
   - Enter: Available study hours, start time, and break duration (5-20 min).
   - Interleaves focus blocks with rest breaks to maximize cognitive retention.
   - Interactive task actions: Mark completed, edit, delete, reschedule date, or launch a focus timer.

5. **Weak Topic Detection & Performance Diagnostics**
   - Record quiz and test results: Subject, topic, marks obtained, total marks, test date.
   - Categorizes topics automatically:
     - ❌ **Weak (< 50%)**: Flags urgent remediation and automatically adds to the spaced revision queue.
     - ⚠️ **Average (50% – 72%)**: Suggests targeted conceptual review.
     - ✅ **Mastered (> 72%)**: Recommends maintenance recall.
   - Identifies and highlights: *"Your weakest topic is [Topic Name] ([Score]%)"* with tailored advice.

6. **Expected Exam Score Prediction (ML Regression)**
   - **Algorithm**: Gradient Boosting Regressor predicting continuous final examination scores (0–100%).
   - Inputs: Daily study hours, syllabus completion %, past marks, revision count, practice test score, days to exam, and difficulty.
   - Simulates **What-If Improvement Potential** (e.g. *"+7.7% score uplift if you add 1 revision round and 1.5h daily study"*).
   - Includes educational disclaimer: AI-driven projection based on historical preparation patterns.

7. **Spaced Revision Tracker**
   - Uses the Ebbinghaus forgetting curve principle:
     - 1st Revision $\rightarrow$ +2 days
     - 2nd Revision $\rightarrow$ +4 days
     - 3rd Revision $\rightarrow$ +7 days
     - 4th+ Revision $\rightarrow$ +14 days
   - Visual category columns: 🔴 **Revision Due**, 🟡 **Revision Soon**, 🟢 **Recently Revised**.
   - "Mark Revised" action automatically computes the next interval and logs focus time.

8. **Pomodoro Focus Timer**
   - Interactive circular timer with study mode (default 25 min) and break mode (default 5 min).
   - Quick presets: 25/5 min, 45/10 min, 50/10 min, plus custom duration inputs.
   - Sound/visual alert on completion.
   - Completed focus sessions are automatically recorded to the database and update daily study hours and streaks.

9. **Progress Analytics & Study Streak**
   - 4 Interactive Visual Charts:
     1. Syllabus completion by subject
     2. Daily study hours over the past 7 days
     3. Average test performance by subject
     4. Subject priority distribution
   - 🔥 **7-Day Study Streak Tracker** with weekly day-by-day status indicators.

10. **Academic Calendar**
    - Monthly interactive calendar showing upcoming exam dates (🔴), scheduled study tasks (🔵), and spaced revision due dates (🟡).
    - Click any date to view scheduled activities for that day.

11. **Student Profile & Settings**
    - Manage student full name, email, degree/course, semester, college, and daily available study hours.

12. **About Project & Viva Examination Guide**
    - Detailed viva reference with project objectives, ML mathematical formulations, architectural diagrams, and model viva Q&A.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Lucide Icons, Pure Modern CSS Design System (Responsive) |
| **Backend** | Python FastAPI, Uvicorn ASGI Server, Pydantic Schema Validation, CORS |
| **Database** | SQLite3 (`studyplanner.db`) with relational schemas and foreign keys |
| **Machine Learning** | Scikit-Learn (Random Forest, Gradient Boosting), Pandas, NumPy, Joblib |

---

## 🚀 Quick Start / How to Run Locally

### Prerequisites
- Python 3.10+ (Python 3.14 verified)
- Node.js 18+ and npm

### 1. Start the FastAPI Backend
Open a terminal in the project root:
```bash
# Optional: create a virtual environment
# python -m venv venv && source venv/bin/activate  (or venv\Scripts\activate on Windows)

# Install backend dependencies (if not already installed)
pip install fastapi uvicorn pydantic scikit-learn pandas numpy

# Initialize the database & seed demo data
python backend/database.py

# Launch the backend API server (runs on port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI) is available at: **http://127.0.0.1:8000/docs**

### 2. Start the React Frontend
Open a second terminal in the `frontend` directory:
```bash
cd frontend

# Install npm dependencies (if first time)
npm install

# Start Vite development server (runs on port 3000)
npm run dev -- --host 127.0.0.1 --port 3000
```
Open your browser and navigate to: **http://127.0.0.1:3000/**

---

## 🎓 Demo Credentials

A realistic demo account is pre-seeded with 5 subjects (Machine Learning, DBMS, Computer Networks, Software Engineering, VLSI Design), test results, study blocks, and a 7-day study streak:

- **Email:** `student@college.edu`
- **Password:** `student123`
- *Or simply click the **"One-Click Login"** button on the sign-in screen.*

---

## 🧠 Machine Learning Module Structure

```
ml/
├── generate_dataset.py   # Generates 1,500 balanced student academic records
├── dataset.csv           # Synthetic training dataset with 10 academic features
├── priority_model.py     # Classification & Urgency Scoring (Random Forest)
├── score_prediction.py   # Continuous Exam Performance Regressor (Gradient Boosting)
└── saved_models/         # Serialized Joblib model binaries
    ├── priority_model.joblib
    └── score_regressor.joblib
```

### Classification Features (`ml/priority_model.py`)
- `days_remaining`
- `syllabus_completion` (%)
- `difficulty` (1 to 5)
- `previous_marks` (%)
- `confidence_level` (1 to 5)
- `available_study_time` (hours)
- `revision_count`

### Regression Features (`ml/score_prediction.py`)
- `daily_study_hours`
- `syllabus_completion` (%)
- `previous_marks` (%)
- `revision_count`
- `practice_test_score` (%)
- `days_remaining`
- `difficulty` (1 to 5)

---

## 📋 Viva Presentation Checklist

When presenting this mini project:
1. **Login Flow**: Demonstrate the student authentication or 1-click demo login.
2. **Dashboard Overview**: Explain the 5 summary cards and the AI recommendation card.
3. **ML Subject Priority**: Show how changing days remaining or syllabus gap dynamically changes a subject from LOW to HIGH priority with explainable reasoning.
4. **Weak Topic Detection**: Show how quiz results < 50% are automatically flagged with ❌ and recommended for extra study time.
5. **Expected Score Predictor**: Adjust the daily study hours slider to showcase the real-time regression curve and what-if uplift simulation.
6. **Smart Daily Study Plan**: Generate a timetable from the planner tab and demonstrate checking off a completed task.
7. **Pomodoro Timer**: Show how completing a focus session automatically logs minutes into the database and maintains the study streak.
8. **Spaced Revision**: Explain the Ebbinghaus forgetting curve intervals (+2, +4, +7, +14 days) and demonstrate the "Mark Revised" button.
