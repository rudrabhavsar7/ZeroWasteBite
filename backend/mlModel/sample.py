import pandas as pd
import random

# Define possible values
food_types = ["cooked_veg", "non_veg", "packaged", "raw"]
storages = ["fridge", "room_temp"]
environments = ["dry", "humid"]
is_sealed_options = [True, False]

# Risk determination logic
def determine_risk(food_type, storage, time_since_prep, is_sealed, environment):
    risk_score = 0
    if not is_sealed:
        risk_score += 1
    if time_since_prep > 24:
        risk_score += 2
    elif time_since_prep > 12:
        risk_score += 1
    if storage == "room_temp":
        risk_score += 1
    if food_type == "non_veg":
        risk_score += 1
    elif food_type == "raw":
        risk_score += 2
    if environment == "humid":
        risk_score += 1

    if risk_score <= 2:
        return "low"
    elif risk_score <= 4:
        return "medium"
    else:
        return "high"

# Generate balanced data
def generate_strictly_balanced_dataset(samples_per_group=30):
    final_data = []
    group_counts = {(ft, rl): 0 for ft in food_types for rl in ["low", "medium", "high"]}
    total_required = samples_per_group * len(group_counts)
    attempts = 0
    max_attempts = 500000

    while sum(group_counts.values()) < total_required and attempts < max_attempts:
        food_type = random.choice(food_types)
        storage = random.choice(storages)
        time_since_prep = round(random.uniform(1, 36), 1)
        is_sealed = random.choice(is_sealed_options)
        environment = random.choice(environments)

        risk = determine_risk(food_type, storage, time_since_prep, is_sealed, environment)
        group_key = (food_type, risk)

        if group_counts[group_key] < samples_per_group:
            sample = {
                "food_type": food_type,
                "storage": storage,
                "time_since_prep": time_since_prep,
                "is_sealed": is_sealed,
                "environment": environment,
                "safeForHours": round(random.uniform(2, 24), 1),
                "confidence": round(random.uniform(0.7, 1.0), 2),
                "riskLevel": risk
            }
            final_data.append(sample)
            group_counts[group_key] += 1

        attempts += 1

    print("Generated samples per group:")
    for key, count in group_counts.items():
        print(f"{key}: {count}")
    return final_data

# Create and save dataset
balanced_dataset = generate_strictly_balanced_dataset(samples_per_group=30)
df = pd.DataFrame(balanced_dataset)
df.to_csv("strict_balanced_risk_foodtype_dataset.csv", index=False)
print("\n✅ Final dataset saved as 'strict_balanced_risk_foodtype_dataset.csv'")

