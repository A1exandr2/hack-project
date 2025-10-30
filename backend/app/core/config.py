# app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    ORS_API_KEY: str = os.getenv("ORS_API_KEY")
    GIGACHAT_API_KEY: str = os.getenv("GIGACHAT_API_KEY")  # ← новое
    CSV_PATH: str = os.getenv("CSV_PATH", "app/places.csv")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "paraphrase-multilingual-MiniLM-L12-v2")
    MAX_WALK_TIME_HOURS: float = float(os.getenv("MAX_WALK_TIME_HOURS", "8"))

settings = Settings()