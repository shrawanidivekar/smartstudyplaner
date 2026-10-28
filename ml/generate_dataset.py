"""
Synthetic Dataset Generator for Smart Study Planner ML Models.
Generates realistic college student academic records for:
1. Classification: Subject Priority (HIGH, MEDIUM, LOW) & Priority Score (0-100)
2. Regression: Expected Exam Score Prediction (0-100%)
"""

import numpy as np
import pandas as pd
import os

def generate_data(num_samples=1500, random_state=42):
    np.random.seed(random_state)
    
    # Features
    days_remaining = np.random.randint(1, 50, size=num_samples)
    syllabus_completion = np.random.uniform(10.0, 95.0, size=num_samples)
    difficulty = np.random.choice([1, 2, 3, 4, 5], size=num_samples, p=[0.1, 0.2, 0.35, 0.25, 0.1])
    previous_marks = np.random.normal(64, 15, size=num_samples)
    previous_marks = np.clip(previous_marks, 25.0, 98.0)
    
    confidence_level = np.random.choice([1, 2, 3, 4, 5], size=num_samples, p=[0.15, 0.25, 0.3, 0.2, 0.1])
    available_study_time = np.random.uniform(1.0, 6.0, size=num_samples)
    revision_count = np.random.choice([0, 1, 2, 3, 4, 5], size=num_samples, p=[0.25, 0.3, 0.2, 0.15, 0.07, 0.03])
    
    # Practice test score
    practice_test_score = previous_marks * 0.55 + revision_count * 3.5 + (syllabus_completion / 100.0) * 20.0 + np.random.normal(0, 4, size=num_samples)
    practice_test_score = np.clip(practice_test_score, 20.0, 99.0)
    
    daily_study_hours = np.random.uniform(1.0, 6.5, size=num_samples)

    # Priority calculation
    # Urgency increases strongly when days < 15
    urgency_factor = np.clip((45.0 - days_remaining) / 45.0 * 100.0, 0, 100)
    syllabus_gap = 100.0 - syllabus_completion
    difficulty_factor = (difficulty / 5.0) * 100.0
    marks_risk = 100.0 - previous_marks
    confidence_gap = (5 - confidence_level) * 20.0
    revision_deficit = np.clip((3 - revision_count) * 25.0, 0, 100)
    
    raw_priority = (
        0.32 * urgency_factor +
        0.24 * syllabus_gap +
        0.16 * difficulty_factor +
        0.14 * marks_risk +
        0.08 * confidence_gap +
        0.06 * revision_deficit +
        np.random.normal(0, 2.5, size=num_samples)
    )
    priority_score = np.clip(raw_priority, 5.0, 99.0).round(1)
    
    # Priority Label thresholds:
    # Top 30% -> HIGH, Middle 45% -> MEDIUM, Bottom 25% -> LOW
    priority_label = []
    for p in priority_score:
        if p >= 58:
            priority_label.append("HIGH")
        elif p >= 38:
            priority_label.append("MEDIUM")
        else:
            priority_label.append("LOW")
            
    # Expected Exam Score (%)
    raw_exam_score = (
        0.32 * syllabus_completion +
        0.30 * practice_test_score +
        0.16 * previous_marks +
        2.2 * revision_count +
        1.6 * daily_study_hours -
        2.0 * (difficulty - 3) +
        np.random.normal(0, 3.0, size=num_samples)
    )
    expected_exam_score = np.clip(raw_exam_score, 28.0, 98.5).round(1)
    
    df = pd.DataFrame({
        "days_remaining": days_remaining,
        "syllabus_completion": np.round(syllabus_completion, 1),
        "difficulty": difficulty,
        "previous_marks": np.round(previous_marks, 1),
        "confidence_level": confidence_level,
        "available_study_time": np.round(available_study_time, 1),
        "revision_count": revision_count,
        "practice_test_score": np.round(practice_test_score, 1),
        "daily_study_hours": np.round(daily_study_hours, 1),
        "priority_score": priority_score,
        "priority_label": priority_label,
        "expected_exam_score": expected_exam_score
    })
    
    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(current_dir, "dataset.csv")
    df = generate_data()
    df.to_csv(output_path, index=False)
    print(f"Generated dataset with {len(df)} samples saved to {output_path}")
    print("Class distribution:\n", df["priority_label"].value_counts())
