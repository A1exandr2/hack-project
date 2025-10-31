from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from starlette.background import BackgroundTasks
import pandas as pd
import os
import tempfile
from app.core.config import settings

router = APIRouter(
    prefix="/api"
)

CSV_PATH = settings.CSV_PATH

def cleanup_tempfile(path: str):
    try:
        os.unlink(path)
    except Exception:
        pass

@router.get("/getplaces", summary="Скачать список мест в excel")
async def get_places_as_excel(background_tasks: BackgroundTasks):
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="Файл с местами не найден")

    try:
        df = pd.read_csv(CSV_PATH)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            df.to_excel(tmp.name, index=False, engine="openpyxl")
            tmp_path = tmp.name

        background_tasks.add_task(cleanup_tempfile, tmp_path)

        return FileResponse(
            path=tmp_path,
            filename="places_nizhny_novgorod.xlsx",
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="CSV-файл пуст")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при создании Excel: {str(e)}")