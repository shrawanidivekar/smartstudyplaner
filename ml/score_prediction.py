"""
Expected Exam Score Prediction Module (Regression)
Model: Ridge & Gradient Boosting Regressor
Predicts expected exam performance (0 - 100%) based on study habits, past marks, and preparation level.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "score_regressor.joblib")
DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dataset.csv")

FEATURE_NAMES = [
    "daily_study_hours",
    "syllabus_completion",
    "previous_marks",
    "revision_count",
    "practice_test_score",
    "days_remaining",
    "difficulty"
]

class ScorePredictor:
    def __init__(self):
        self.regressor = None
        self.r2 = None
        self._load_or_train()

    def _train(self):
        if not os.path.exists(DATASET_PATH):
            from ml.generate_dataset import generate_data
            df = generate_data()
            df.to_csv(DATASET_PATH, index=False)
        else:
            df = pd.read_csv(DATASET_PATH)

        X = df[FEATURE_NAMES]
        y = df["expected_exam_score"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        self.regressor = GradientBoostingRegressor(
            n_estimators=100, learning_rate=0.08, max_depth=4, random_state=42
        )
        self.regressor.fit(X_train, y_train)

        y_pred = self.regressor.predict(X_test)
        self.r2 = r2_score(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        print(f"[ML Score Regressor] Trained with R2: {self.r2:.4f}, RMSE: {rmse:.2f}")

        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump({
            "regressor": self.regressor,
            "r2": self.r2,
            "feature_names": FEATURE_NAMES
        }, MODEL_PATH)

    def _load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self.regressor = data["regressor"]
                self.r2 = data.get("r2", 0.94)
                return
            except Exception as e:
                print(f"[ML Score Regressor] Error loading model: {e}. Retraining...")
        self._train()

    def predict(self, daily_study_hours, syllabus_completion, previous_marks,
                revision_count=0, practice_test_score=None, days_remaining=15, difficulty=3):
        """
        Predicts expected exam score percentage and provides constructive improvement recommendations.
        """
        daily_study_hours = float(np.clip(daily_study_hours, 0.5, 12.0))
        syllabus_completion = float(np.clip(syllabus_completion, 0.0, 100.0))
        previous_marks = float(np.clip(previous_marks, 0.0, 100.0))
        revision_count = max(0, int(revision_count))
        
        # If practice test score is not provided, estimate from previous marks and syllabus
        if practice_test_score is None or practice_test_score <= 0:
            practice_test_score = previous_marks * 0.7 + (syllabus_completion / 100.0) * 20.0
        practice_test_score = float(np.clip(practice_test_score, 0.0, 100.0))
        
        days_remaining = max(1, int(days_remaining))
        difficulty = int(np.clip(difficulty, 1, 5))

        df_input = pd.DataFrame([{
            "daily_study_hours": daily_study_hours,
            "syllabus_completion": syllabus_completion,
            "previous_marks": previous_marks,
            "revision_count": revision_count,
            "practice_test_score": practice_test_score,
            "days_remaining": days_remaining,
            "difficulty": difficulty
        }])

        predicted_val = float(self.regressor.predict(df_input)[0])
        predicted_score = float(np.clip(predicted_val, 25.0, 99.0).round(1))

        # Recommendations based on gaps
        recommendations = []
        if syllabus_completion < 70:
            potential_gain = min(12.0, (85.0 - syllabus_completion) * 0.25)
            recommendations.append(
                f"Increasing syllabus coverage towards 85% could lift your score by approximately +{potential_gain:.1f}%."
            )
        if revision_count < 2:
            recommendations.append(
                "Aim for at least 2 active recall / spaced revision cycles to lock in long-term memory."
            )
        if daily_study_hours < 3.0 and days_remaining < 20:
            recommendations.append(
                "Adding 1 to 1.5 focused study hours daily during final 3 weeks provides significant momentum."
            )
        if practice_test_score < 60:
            recommendations.append(
                "Take weekly mock quizzes on weak topics to convert conceptual doubts into test readiness."
            )
        if not recommendations:
            recommendations.append("Excellent study trajectory! Maintain consistent daily revision sessions.")

        # Simulate "What-If" boost potential
        simulated_input = df_input.copy()
        simulated_input["syllabus_completion"] = min(100.0, syllabus_completion + 15.0)
        simulated_input["revision_count"] = revision_count + 1
        simulated_input["daily_study_hours"] = min(8.0, daily_study_hours + 1.0)
        boosted_score = float(self.regressor.predict(simulated_input)[0])
        potential_uplift = round(max(1.0, boosted_score - predicted_score), 1)

        return {
            "predicted_score": predicted_score,
            "potential_uplift": potential_uplift,
            "explanation": " ".join(recommendations),
            "recommendations": recommendations,
            "disclaimer": "This is an AI-driven statistical projection based on past academic metrics and prep habits. It is designed for guidance and is not a guaranteed grade.",
            "inputs": {
                "daily_study_hours": daily_study_hours,
                "syllabus_completion": syllabus_completion,
                "previous_marks": previous_marks,
                "revision_count": revision_count,
                "practice_test_score": practice_test_score,
                "days_remaining": days_remaining,
                "difficulty": difficulty
            }
        }

# Global singleton
score_predictor = ScorePredictor()

if __name__ == "__main__":
    res = score_predictor.predict(
        daily_study_hours=2.5,
        syllabus_completion=60.0,
        previous_marks=68.0,
        revision_count=1,
        practice_test_score=64.0,
        days_remaining=12,
        difficulty=3
    )
    print("Score Prediction Output:", res)
