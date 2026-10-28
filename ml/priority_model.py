"""
Subject Priority Prediction Module (Classification & Scoring)
Model: Random Forest Classifier + Priority Score Regression / Heuristic Mapping
Features:
- days_remaining: int
- syllabus_completion: float (0 - 100%)
- difficulty: int (1 - 5)
- previous_marks: float (0 - 100%)
- confidence_level: int (1 - 5)
- available_study_time: float (hours)
- revision_count: int
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "priority_model.joblib")
DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset.csv")

FEATURE_NAMES = [
    "days_remaining",
    "syllabus_completion",
    "difficulty",
    "previous_marks",
    "confidence_level",
    "available_study_time",
    "revision_count"
]

class PriorityPredictor:
    def __init__(self):
        self.clf = None
        self.score_regressor = None
        self.accuracy = None
        self._load_or_train()

    def _train(self):
        if not os.path.exists(DATASET_PATH):
            from ml.generate_dataset import generate_data
            df = generate_data()
            df.to_csv(DATASET_PATH, index=False)
        else:
            df = pd.read_csv(DATASET_PATH)

        X = df[FEATURE_NAMES]
        y_class = df["priority_label"]
        y_score = df["priority_score"]

        X_train, X_test, y_class_train, y_class_test, y_score_train, y_score_test = train_test_split(
            X, y_class, y_score, test_size=0.2, random_state=42, stratify=y_class
        )

        self.clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        self.clf.fit(X_train, y_class_train)

        self.score_regressor = GradientBoostingRegressor(n_estimators=80, max_depth=4, random_state=42)
        self.score_regressor.fit(X_train, y_score_train)

        y_pred = self.clf.predict(X_test)
        self.accuracy = accuracy_score(y_class_test, y_pred)
        print(f"[ML Priority] Trained Classifier with Accuracy: {self.accuracy:.4f}")

        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump({
            "clf": self.clf,
            "score_regressor": self.score_regressor,
            "accuracy": self.accuracy,
            "feature_names": FEATURE_NAMES
        }, MODEL_PATH)

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self.clf = data["clf"]
                self.score_regressor = data["score_regressor"]
                self.accuracy = data.get("accuracy", 0.92)
                return
            except Exception as e:
                print(f"[ML Priority] Error loading model: {e}. Retraining...")
        self._train()

    def predict(self, days_remaining, syllabus_completion, difficulty, previous_marks,
                confidence_level=3, available_study_time=3.0, revision_count=0):
        """
        Predicts priority level, numerical score (0-100), and generates human-readable reasoning.
        """
        # Ensure numerical bounds
        days_remaining = max(0, int(days_remaining))
        syllabus_completion = float(np.clip(syllabus_completion, 0.0, 100.0))
        difficulty = int(np.clip(difficulty, 1, 5))
        previous_marks = float(np.clip(previous_marks, 0.0, 100.0))
        confidence_level = int(np.clip(confidence_level, 1, 5))
        available_study_time = float(np.clip(available_study_time, 0.5, 12.0))
        revision_count = max(0, int(revision_count))

        features = pd.DataFrame([{
            "days_remaining": days_remaining,
            "syllabus_completion": syllabus_completion,
            "difficulty": difficulty,
            "previous_marks": previous_marks,
            "confidence_level": confidence_level,
            "available_study_time": available_study_time,
            "revision_count": revision_count
        }])

        priority_label = self.clf.predict(features)[0]
        priority_score = float(self.score_regressor.predict(features)[0])
        priority_score = float(np.clip(priority_score, 5.0, 99.0).round(1))

        # Enforce consistency: if score >= 65, label is HIGH; if < 38, LOW
        if priority_score >= 65 and priority_label != "HIGH":
            priority_label = "HIGH"
        elif priority_score < 38 and priority_label != "LOW":
            priority_label = "LOW"

        # Generate reasons
        reasons = []
        if days_remaining <= 5:
            reasons.append(f"Exam is in only {days_remaining} day(s) - high urgency")
        elif days_remaining <= 14:
            reasons.append(f"Exam is approaching in {days_remaining} days")
        else:
            reasons.append(f"{days_remaining} days remaining until exam")

        if syllabus_completion < 45:
            reasons.append(f"Low syllabus completion ({syllabus_completion:.0f}%) requires immediate focus")
        elif syllabus_completion < 75:
            reasons.append(f"Moderate syllabus completion ({syllabus_completion:.0f}%)")
        else:
            reasons.append(f"Strong syllabus coverage ({syllabus_completion:.0f}%)")

        if difficulty >= 4:
            reasons.append(f"Challenging subject difficulty ({difficulty}/5)")

        if previous_marks < 55:
            reasons.append(f"Past score ({previous_marks:.0f}%) indicates need for reinforcement")
        elif previous_marks >= 75:
            reasons.append(f"Consistent past foundation ({previous_marks:.0f}%)")

        if confidence_level <= 2:
            reasons.append(f"Self-reported confidence is low ({confidence_level}/5)")

        if revision_count == 0:
            reasons.append("Zero revision rounds completed yet")
        elif revision_count >= 3:
            reasons.append(f"{revision_count} revision cycles already completed")

        return {
            "priority": priority_label,
            "priority_score": round(priority_score, 1),
            "reasons": reasons,
            "feature_summary": {
                "days_remaining": days_remaining,
                "syllabus_completion": syllabus_completion,
                "difficulty": difficulty,
                "previous_marks": previous_marks,
                "confidence_level": confidence_level,
                "revision_count": revision_count
            }
        }

# Global singleton
priority_predictor = PriorityPredictor()

if __name__ == "__main__":
    test_result = priority_predictor.predict(
        days_remaining=4,
        syllabus_completion=35.0,
        difficulty=4,
        previous_marks=52.0,
        confidence_level=2,
        available_study_time=3.5,
        revision_count=0
    )
    print("Test Prediction Output:", test_result)
