from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HealthMetrics(BaseModel):
    sleep_hours: float    # Goal: 7-9 hrs
    activity_mins: float  # Goal: 30 mins/day
    nutrition_score: int  # Scale 1-10
    hydration_liters: float # Goal: 2-3L
    timestamp: Optional[datetime] = None