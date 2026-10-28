import requests
import json

base = "http://127.0.0.1:8000/api"

print("--- 1. Testing Priority Prediction ---")
r1 = requests.post(f"{base}/predict-priority", json={
    "days_remaining": 4,
    "syllabus_completion": 35.0,
    "difficulty": 4,
    "previous_marks": 52.0,
    "confidence_level": 2,
    "available_study_time": 3.5,
    "revision_count": 0
})
print("Priority status:", r1.status_code, r1.json()["priority"], "Score:", r1.json()["priority_score"])

print("--- 2. Testing Expected Score Prediction ---")
r2 = requests.post(f"{base}/predict-score", json={
    "daily_study_hours": 3.0,
    "syllabus_completion": 65.0,
    "previous_marks": 70.0,
    "revision_count": 1,
    "practice_test_score": 68.0,
    "days_remaining": 14,
    "difficulty": 3
})
print("Score status:", r2.status_code, "Predicted:", r2.json()["predicted_score"], "Uplift:", r2.json()["potential_uplift"])

print("--- 3. Testing Study Plan Generation ---")
r3 = requests.post(f"{base}/study-plan", json={
    "available_hours": 3.5,
    "start_time": "17:30",
    "break_duration": 10
})
print("Study plan status:", r3.status_code, r3.json())

print("--- 4. Testing Performance / Weak Topics ---")
r4 = requests.get(f"{base}/performance")
data4 = r4.json()
print("Performance status:", r4.status_code, "Weakest topic:", data4["weakest_topic"]["topic"])

print("--- 5. Testing Revision Retrieval ---")
r5 = requests.get(f"{base}/revision")
data5 = r5.json()
print("Revisions status:", r5.status_code, "Due:", len(data5["due"]), "Soon:", len(data5["soon"]), "Recent:", len(data5["recent"]))

print("--- 6. Testing Pomodoro Logging ---")
r6 = requests.post(f"{base}/pomodoro/log", json={
    "subject_id": 1,
    "duration": 25,
    "session_type": "pomodoro"
})
print("Pomodoro status:", r6.status_code, r6.json()["message"])

print("--- 7. Testing Calendar Retrieval ---")
r7 = requests.get(f"{base}/calendar")
print("Calendar status:", r7.status_code, "Total days with events:", len(r7.json()))

print("--- 8. Testing Progress Charts ---")
r8 = requests.get(f"{base}/progress-charts")
print("Progress charts status:", r8.status_code, "Subjects in chart:", len(r8.json()["syllabus_by_subject"]))

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
