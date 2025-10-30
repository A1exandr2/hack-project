# app/services/planner_service.py
import asyncio
import math
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
from app.core.config import settings
from app.utils.routing import get_ors_walking_time
from app.services.giga_service import GigaChatService

def haversine_fast(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Инициализируем GigaChat один раз
giga_service = GigaChatService(api_key=settings.GIGACHAT_API_KEY)

async def explain_with_gigachat(interests: str, place_title: str, place_desc: str) -> str:
    try:
        prompt = f"""
Вы — дружелюбный и знающий гид по Нижнему Новгороду. 
Пользователь интересуется: «{interests}».
Объясните кратко (1–2 предложения), почему стоит посетить «{place_title}».
Описание объекта: {place_desc[:600]}...
Ответ должен быть живым, увлекательным и персонализированным. Начните с фразы вроде «Здесь вы сможете...» или «Это идеально подходит, потому что...».
        """.strip()

        # Выполняем синхронный вызов внутри async через asyncio.to_thread
        explanation = await asyncio.to_thread(
            giga_service.ask,
            prompt=prompt,
            temperature=0.6,
            max_tokens=120
        )
        return explanation
    except Exception as e:
        return f"Подобрано по вашему интересу: «{interests}»."

async def generate_route_plan(
    interests: str,
    time_hours: float,
    user_lat: float,
    user_lon: float,
    df,
    embeddings,
    model
) -> Dict[str, Any]:
    if time_hours <= 0 or time_hours > settings.MAX_WALK_TIME_HOURS:
        raise ValueError("Некорректное время")

    # === 1. Семантический отбор ===
    user_embedding = model.encode([interests], convert_to_numpy=True)
    sims = cosine_similarity(user_embedding, embeddings).flatten()
    df_ranked = df.copy()
    df_ranked['similarity'] = sims
    df_ranked = df_ranked.sort_values('similarity', ascending=False).reset_index(drop=True)

    # === 2. Быстрая фильтрация ===
    MAX_WALK_KM = time_hours * 5.0
    df_ranked['est_dist_km'] = df_ranked.apply(
        lambda row: haversine_fast(user_lat, user_lon, row['lat'], row['lon']),
        axis=1
    )
    candidates = df_ranked[df_ranked['est_dist_km'] <= MAX_WALK_KM].head(20)
    if candidates.empty:
        raise ValueError("Нет объектов в радиусе")

    # === 3. ORS от пользователя до каждой точки ===
    async def fetch_from_user(row):
        res = await get_ors_walking_time(user_lat, user_lon, row['lat'], row['lon'], settings.ORS_API_KEY)
        return (res, row) if res else None

    tasks = [fetch_from_user(row) for _, row in candidates.iterrows()]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    valid_places = []
    for res in results:
        if not isinstance(res, Exception) and res:
            (duration_sec, distance_m), row = res
            if duration_sec <= time_hours * 3600:
                valid_places.append({
                    "row": row,
                    "index": row.name,
                    "from_user_sec": duration_sec,
                    "from_user_m": distance_m
                })

    if not valid_places:
        raise ValueError("Нет объектов с учётом времени ходьбы")

    # === 4. Построение цепочки с учётом ПОЛНОГО времени ===
    current_lat, current_lon = user_lat, user_lon
    route = []
    total_duration_min = 0.0  # walking + visit, в минутах
    max_duration_min = time_hours * 60
    used_indices = set()

    for _ in range(5):
        if len(used_indices) >= len(valid_places):
            break

        best_item = None
        best_walk_min = float('inf')
        best_dist = 0

        for item in valid_places:
            if item["index"] in used_indices:
                continue
            res = await get_ors_walking_time(
                current_lat, current_lon,
                item["row"]["lat"], item["row"]["lon"],
                settings.ORS_API_KEY
            )
            if res is None:
                est_dist_km = haversine_fast(current_lat, current_lon, item["row"]["lat"], item["row"]["lon"])
                walk_min = (est_dist_km / 5.0) * 60  # км / (5 км/ч) → часы → *60 = минуты
                walk_m = est_dist_km * 1000
            else:
                walk_min = res[0] / 60
                walk_m = res[1]

            if walk_min < best_walk_min:
                best_walk_min = walk_min
                best_dist = walk_m
                best_item = item

        if not best_item:
            break

        # Определяем время осмотра
        is_park = "парк" in (best_item["row"]["title"] + " " + str(best_item["row"]["description"])).lower()
        visit_min = 35.0 if is_park else 25.0

        # Проверяем, влезет ли объект в общий лимит
        new_total = total_duration_min + best_walk_min + visit_min
        if new_total > max_duration_min:
            break

        # Добавляем
        route.append({
            **best_item,
            "walk_min": best_walk_min,
            "walk_m": best_dist,
            "visit_min": visit_min
        })
        total_duration_min = new_total
        current_lat = best_item["row"]["lat"]
        current_lon = best_item["row"]["lon"]
        used_indices.add(best_item["index"])

    if not route:
        raise ValueError("Не удалось построить маршрут")

    # === 5. Генерация объяснений через GigaChat ===
    explanation_tasks = [
        explain_with_gigachat(
            interests,
            place["row"]["title"],
            place["row"]["description"] or ""
        )
        for place in route
    ]
    explanations = await asyncio.gather(*explanation_tasks)

    # === 6. Формирование ответа ===
    plan = []
    total_walking_min = 0.0
    total_visit_min = 0.0

    for i, place in enumerate(route):
        plan.append({
            "title": str(place["row"]["title"]),
            "why": explanations[i],
            "walking_time_min": round(place["walk_min"], 1),
            "visit_duration_min": place["visit_min"]
        })
        total_walking_min += place["walk_min"]
        total_visit_min += place["visit_min"]

    total_duration_hours = (total_walking_min + total_visit_min) / 60

    return {
        "summary": {
            "total_places": len(plan),
            "total_walking_time_min": round(total_walking_min, 1),
            "total_duration_hours": round(total_duration_hours, 1)
        },
        "plan": plan
    }