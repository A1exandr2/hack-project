from fastapi import FastAPI
from app.api.endpoints.plan import router as plan_router

app = FastAPI(
    title="AI Tourist Assistant — Nizhny Novgorod",
    description="Планирует пешеходный маршрут по интересам",
    version="1.0"
)

app.include_router(plan_router, prefix="/api", tags=["plan"])