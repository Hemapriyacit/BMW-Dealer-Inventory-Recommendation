import pandas as pd
import numpy as np


# -----------------------------------
# 1. Load dataset
# -----------------------------------

df = pd.read_csv("data/dealer_inventory_features.csv")

print("Dataset loaded!")
print("Original shape:", df.shape)


# -----------------------------------
# 2. Convert month to datetime
# -----------------------------------

df["month"] = pd.to_datetime(df["month"])


# -----------------------------------
# 3. Sort the data
# -----------------------------------

df = df.sort_values(
    ["dealer_id", "model", "month"]
).reset_index(drop=True)


# -----------------------------------
# 4. Previous month sales
# -----------------------------------

df["sales_last_month"] = (
    df.groupby(["dealer_id", "model"])["sales"]
    .shift(1)
)


# -----------------------------------
# 5. Three-month average sales
# -----------------------------------

df["sales_3_month_avg"] = (
    df.groupby(["dealer_id", "model"])["sales"]
    .transform(
        lambda x: x.shift(1).rolling(3).mean()
    )
)


# -----------------------------------
# 6. Six-month average sales
# -----------------------------------

df["sales_6_month_avg"] = (
    df.groupby(["dealer_id", "model"])["sales"]
    .transform(
        lambda x: x.shift(1).rolling(6).mean()
    )
)


# -----------------------------------
# 7. One-month sales growth
# -----------------------------------

previous_previous_sales = (
    df.groupby(["dealer_id", "model"])["sales"]
    .shift(2)
)

df["sales_growth_1m"] = (
    (
        df["sales_last_month"]
        - previous_previous_sales
    )
    /
    previous_previous_sales.replace(0, np.nan)
)


# -----------------------------------
# 8. Regional model demand
# -----------------------------------

df["regional_model_sales"] = (
    df.groupby(
        ["region", "model", "month"]
    )["sales"]
    .transform("mean")
)


# -----------------------------------
# 9. Days of inventory
# -----------------------------------

daily_sales = df["sales_last_month"] / 30

df["days_of_inventory"] = (
    df["current_inventory"]
    /
    daily_sales.replace(0, np.nan)
)


# -----------------------------------
# 10. Inventory turnover
# -----------------------------------

df["inventory_turnover"] = (
    df["sales_last_month"]
    /
    df["current_inventory"].replace(0, np.nan)
)


# -----------------------------------
# 11. Extract month number
# -----------------------------------

df["month_number"] = (
    df["month"].dt.month
)


# -----------------------------------
# 12. Extract quarter
# -----------------------------------

df["quarter"] = (
    df["month"].dt.quarter
)


# -----------------------------------
# 13. Check missing values
# -----------------------------------

print("\nMissing values before cleaning:")

print(
    df[
        [
            "sales_last_month",
            "sales_3_month_avg",
            "sales_6_month_avg",
            "sales_growth_1m",
            "regional_model_sales",
            "days_of_inventory",
            "inventory_turnover",
            "next_month_sales",
        ]
    ]
    .isna()
    .sum()
)


# -----------------------------------
# 14. Remove rows where required
# historical features are unavailable
# -----------------------------------

required_features = [
    "sales_last_month",
    "sales_3_month_avg",
    "sales_6_month_avg",
    "sales_growth_1m",
    "regional_model_sales",
    "days_of_inventory",
    "inventory_turnover",
    "next_month_sales",
]

df = df.dropna(
    subset=required_features
).reset_index(drop=True)


# -----------------------------------
# 15. Convert categorical columns
# -----------------------------------

df = pd.get_dummies(
    df,
    columns=[
        "dealer_id",
        "model",
        "region"
    ],
    dtype=int
)


# -----------------------------------
# 16. Separate features and target
# -----------------------------------

X = df.drop(
    columns=[
        "next_month_sales",
        "month"
    ]
)

y = df["next_month_sales"]


# -----------------------------------
# 17. Display results
# -----------------------------------

print("\nFeature engineering completed!")

print("\nFinal dataset shape:")
print(df.shape)

print("\nX shape:")
print(X.shape)

print("\ny shape:")
print(y.shape)

print("\nFeatures:")
print(X.columns.tolist())


# -----------------------------------
# 18. Save processed dataset
# -----------------------------------

output_file = "data/processed_features.csv"

df.to_csv(
    output_file,
    index=False
)

print("\nProcessed dataset saved to:")
print(output_file)