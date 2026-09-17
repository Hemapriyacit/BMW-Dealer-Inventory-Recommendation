from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from xgboost import XGBRegressor


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_FILE = (
    PROJECT_ROOT
    / "data"
    / "processed_features.csv"
)

ARTIFACTS_DIR = (
    PROJECT_ROOT
    / "artifacts"
)

MODEL_FILE = (
    ARTIFACTS_DIR
    / "best_model.pkl"
)

FEATURE_FILE = (
    ARTIFACTS_DIR
    / "feature_columns.pkl"
)


# ============================================================
# CREATE ARTIFACTS DIRECTORY
# ============================================================

ARTIFACTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# LOAD PROCESSED DATA
# ============================================================

df = pd.read_csv(DATA_FILE)

df["month"] = pd.to_datetime(
    df["month"]
)

print("Processed dataset loaded!")
print(
    f"Dataset shape: {df.shape}"
)


# ============================================================
# SORT CHRONOLOGICALLY
# ============================================================

df = df.sort_values(
    "month"
).reset_index(
    drop=True
)


# ============================================================
# PREPARE FEATURES AND TARGET
# ============================================================

X = df.drop(
    columns=[
        "next_month_sales",
        "month"
    ]
)

y = df["next_month_sales"]


print()
print("Features prepared!")

print(
    f"X shape: {X.shape}"
)

print(
    f"y shape: {y.shape}"
)


# ============================================================
# CHRONOLOGICAL TRAIN / TEST SPLIT
# ============================================================

# Get unique months

unique_months = sorted(
    df["month"].unique()
)


total_months = len(
    unique_months
)


# Use first 80% of months for training

n_train_months = int(
    total_months * 0.80
)


train_months = unique_months[
    :n_train_months
]

test_months = unique_months[
    n_train_months:
]


# Create masks

train_mask = df["month"].isin(
    train_months
)

test_mask = df["month"].isin(
    test_months
)


X_train = X.loc[
    train_mask
]

X_test = X.loc[
    test_mask
]

y_train = y.loc[
    train_mask
]

y_test = y.loc[
    test_mask
]


print()
print(
    "Chronological train/test split created!"
)

print(
    f"Total months : {total_months}"
)

print(
    f"Training months: {len(train_months)}"
)

print(
    f"Testing months : {len(test_months)}"
)

print()

print(
    f"X_train: {X_train.shape}"
)

print(
    f"X_test : {X_test.shape}"
)

print(
    f"y_train: {y_train.shape}"
)

print(
    f"y_test : {y_test.shape}"
)


# ============================================================
# DISPLAY TRAINING / TESTING PERIOD
# ============================================================

print()
print("Training period:")

print(
    f"{train_months[0]} "
    f"to "
    f"{train_months[-1]}"
)


print()
print("Testing period:")

print(
    f"{test_months[0]} "
    f"to "
    f"{test_months[-1]}"
)


# ============================================================
# MODEL EVALUATION FUNCTION
# ============================================================

def evaluate_model(
    model,
    model_name
):

    print()
    print(
        f"Training {model_name}..."
    )

    model.fit(
        X_train,
        y_train
    )

    print(
        f"{model_name} trained successfully!"
    )


    # Make predictions

    predictions = model.predict(
        X_test
    )


    # Calculate metrics

    mae = mean_absolute_error(
        y_test,
        predictions
    )

    rmse = mean_squared_error(
        y_test,
        predictions
    ) ** 0.5

    r2 = r2_score(
        y_test,
        predictions
    )


    print()
    print("Performance:")

    print(
        f"MAE : {mae:.4f}"
    )

    print(
        f"RMSE: {rmse:.4f}"
    )

    print(
        f"R2  : {r2:.4f}"
    )


    return {
        "Model": model_name,
        "MAE": mae,
        "RMSE": rmse,
        "R2": r2,
        "model_object": model,
    }


# ============================================================
# MODEL 1 — LINEAR REGRESSION
# ============================================================

linear_model = LinearRegression()

linear_result = evaluate_model(
    linear_model,
    "Linear Regression"
)


# ============================================================
# MODEL 2 — RANDOM FOREST
# ============================================================

random_forest_model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

random_forest_result = evaluate_model(
    random_forest_model,
    "Random Forest"
)


# ============================================================
# MODEL 3 — XGBOOST
# ============================================================

xgboost_model = XGBRegressor(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    n_jobs=-1,
    objective="reg:squarederror"
)

xgboost_result = evaluate_model(
    xgboost_model,
    "XGBoost"
)


# ============================================================
# MODEL COMPARISON
# ============================================================

results = [
    linear_result,
    random_forest_result,
    xgboost_result,
]


comparison = pd.DataFrame(
    [
        {
            "Model": result["Model"],
            "MAE": result["MAE"],
            "RMSE": result["RMSE"],
            "R2": result["R2"],
        }
        for result in results
    ]
)


print()
print("=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

print(
    comparison.to_string(
        index=False
    )
)


# ============================================================
# SELECT BEST MODEL
# ============================================================

# Lower MAE = better

best_result = min(
    results,
    key=lambda result:
    result["MAE"]
)


best_model = best_result[
    "model_object"
]

best_model_name = best_result[
    "Model"
]


print()
print(
    "Best Model based on MAE:"
)

print(
    best_model_name
)


# ============================================================
# SAVE BEST MODEL
# ============================================================

joblib.dump(
    best_model,
    MODEL_FILE
)


# ============================================================
# SAVE FEATURE COLUMNS
# ============================================================

feature_columns = X.columns.tolist()

joblib.dump(
    feature_columns,
    FEATURE_FILE
)


print()
print(
    "Best model saved to:"
)

print(
    MODEL_FILE
)


print()
print(
    "Feature columns saved to:"
)

print(
    FEATURE_FILE
)


# ============================================================
# SAMPLE PREDICTIONS
# ============================================================

sample_predictions = best_model.predict(
    X_test.head(10)
)


sample_output = pd.DataFrame(
    {
        "Actual": y_test.head(10).values,
        "Predicted": sample_predictions,
    }
)


print()
print(
    "Sample Predictions from Best Model:"
)

print(
    sample_output.to_string(
        index=False
    )
)


# ============================================================
# COMPLETION MESSAGE
# ============================================================

print()
print("=" * 60)
print("MODEL TRAINING COMPLETED")
print("=" * 60)

print(
    f"Best model: {best_model_name}"
)

print(
    f"Model file: {MODEL_FILE}"
)

print(
    f"Feature file: {FEATURE_FILE}"
)

print("=" * 60)