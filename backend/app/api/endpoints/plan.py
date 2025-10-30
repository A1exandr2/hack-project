from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.planner_service import generate_route_plan
from app.utils.data_loader import load_and_prepare_data

router = APIRouter()

df, embeddings, model = load_and_prepare_data()

class RequestModel(BaseModel):
    interests: str
    time_hours: float
    user_lat: float
    user_lon: float

@router.post("/plan", summary="Сгенерировать туристический маршрут")
async def plan_route(req: RequestModel):
    try:
        result = await generate_route_plan(
            req.interests,
            req.time_hours,
            req.user_lat,
            req.user_lon,
            df,
            embeddings,
            model
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ошибка при генерации маршрута")