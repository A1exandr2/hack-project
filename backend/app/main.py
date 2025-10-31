from fastapi import FastAPI
from app.api.endpoints.plan import router as plan_router
from app.api.endpoints.getplaces import router as getplaces_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Tourist Assistant - MAY",
    description="Маршрут по интересам",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],                      
    allow_headers=["*"],
)

app.include_router(plan_router, tags=["plan"])
app.include_router(getplaces_router, tags=["getplaces"])