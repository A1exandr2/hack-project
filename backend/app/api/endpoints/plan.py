from fastapi import APIRouter, HTTPException
from app.model.schemas import RoutePlanResponse, RequestModel
from app.services.planner_service import generate_route_plan
from app.utils.data_loader import load_and_prepare_data
from app.services.geocode import geocode_address

router = APIRouter(
    prefix="/api"
)

df, embeddings, model = load_and_prepare_data()

@router.post("/plan", summary="Сгенерить маршрут")
async def plan_route(req: RequestModel) -> RoutePlanResponse:
    user_lat, user_lon = await geocode_address(req.location)
    try:
        result = await generate_route_plan(
            req.interests,
            req.time_hours,
            user_lat,
            user_lon,
            df,
            embeddings,
            model
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ошибка при генерации маршрута")