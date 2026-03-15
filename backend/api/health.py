from models.health import HealthMetrics

def calculate_wellness_data(metrics: HealthMetrics):
    # 1. Normalize values to standard benchmarks (max 1.0)
    sleep_norm = min(metrics.sleep_hours / 8.0, 1.0) 
    activity_norm = min(metrics.activity_mins / 30.0, 1.0) 
    hydration_norm = min(metrics.hydration_liters / 3.0, 1.0) 
    nutrition_norm = min(metrics.nutrition_score / 10.0, 1.0)

    # 2. Calculate Base Score (Max 100)
    base_score = (activity_norm * 30) + (nutrition_norm * 30) + (sleep_norm * 20) + (hydration_norm * 20)

    # 3. Apply Critical Biological Penalties
    # If hydration drops below 1L or sleep below 3hrs, it acts as a severe multiplier
    hydration_penalty = min(metrics.hydration_liters / 1.0, 1.0)
    sleep_penalty = min(metrics.sleep_hours / 3.0, 1.0)

    # 4. Final Wellness Index
    overall_score = base_score * hydration_penalty * sleep_penalty

    # Determine system status based on final score
    if overall_score < 40:
        stress_level = "CRITICAL FAILURE"
    elif overall_score < 70:
        stress_level = "ELEVATED STRESS"
    else:
        stress_level = "SYSTEM OPTIMAL"

    pie_data = [
        {"name": "Sleep", "value": sleep_norm * 100, "fill": "#8b5cf6"},
        {"name": "Activity", "value": activity_norm * 100, "fill": "#f59e0b"},
        {"name": "Nutrition", "value": nutrition_norm * 100, "fill": "#10b981"},
        {"name": "Hydration", "value": hydration_norm * 100, "fill": "#06b6d4"}
    ]

    bar_data = [
        {"metric": "Sleep", "current": metrics.sleep_hours, "target": 8},
        {"metric": "Activity", "current": metrics.activity_mins, "target": 30},
        {"metric": "Hydration", "current": metrics.hydration_liters, "target": 3},
        {"metric": "Nutrition", "current": metrics.nutrition_score, "target": 10}
    ]

    return {
        "overall_score": round(overall_score, 1),
        "pie_data": pie_data,
        "bar_data": bar_data,
        "stress_level": stress_level
    }