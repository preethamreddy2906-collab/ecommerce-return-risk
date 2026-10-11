import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"

model=joblib.load(MODEL_DIR/"logistic_regression.pkl")
training_columns=joblib.load(MODEL_DIR/"training_columns.pkl")
categorical_columns=joblib.load(MODEL_DIR/"categorical_cols.pkl")

