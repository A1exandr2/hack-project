from typing import List
from pydantic import BaseModel

class PlaceInPlan(BaseModel):
    title: str
    why: str
    walking_time_min: float
    visit_duration_min: float
    lat: float
    lon: float

class RouteSummary(BaseModel):
    total_places: int
    total_walking_time_min: float
    total_duration_hours: float

class RoutePlanResponse(BaseModel):
    summary: RouteSummary
    plan: List[PlaceInPlan]

class RequestModel(BaseModel):
    interests: str
    time_hours: float
    # location: str
    user_lat: float
    user_lon: float
