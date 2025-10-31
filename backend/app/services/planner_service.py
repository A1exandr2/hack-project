import asyncio
import math
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings
from app.utils.routing import get_ors_walking_time
from app.services.giga_service import ask

def haversine_fast(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_park(place_row):
    text = (str(place_row["title"]) + " " + str(place_row["description"])).lower()
    return "парк" in text

def estimate_visit_duration(place_row):
    return 35.0 if is_park(place_row) else 25.0

async def find_best_next_place(current_lat: float, current_lon: float, candidates: List[Dict], used_indices: set):
    best_item = None
    best_walk_min = float('inf')
    best_dist = 0

    for item in candidates:
        if item["index"] in used_indices:
            continue
        res = await get_ors_walking_time(
            current_lat, current_lon,
            item["row"]["lat"], item["row"]["lon"],
            settings.ORS_API_KEY
        )
        if res is None:
            est_dist_km = haversine_fast(current_lat, current_lon, item["row"]["lat"], item["row"]["lon"])
            walk_min = (est_dist_km / 5.0) * 60
            walk_m = est_dist_km * 1000
        else:
            walk_min = res[0] / 60
            walk_m = res[1]

        if walk_min < best_walk_min:
            best_walk_min = walk_min
            best_dist = walk_m
            best_item = item

    if best_item is None:
        return None
    return best_item, best_walk_min, best_dist

async def explain_with_gigachat(interests: str, place_title: str, place_desc: str) -> str:
    """Генерирует персонализированное объяснение с помощью GigaChat."""
    try:
        prompt = f"""
Вы — дружелюбный и знающий гид по Нижнему Новгороду. 
Пользователь интересуется: «{interests}».
Объясните кратко (1–2 предложения), почему стоит посетить «{place_title}».
Описание объекта: {place_desc[:600]}...
Ответ должен быть живым, увлекательным и персонализированным. Начните с фразы вроде «Здесь вы сможете...» или «Это идеально подходит, потому что...».
        """.strip()

        explanation = await asyncio.to_thread(
            ask,
            prompt=prompt,
            temperature=0.6,
            max_tokens=120
        )
        return explanation

    except Exception as e:
        return f"Подобрано по вашему интересу: «{interests}»."

async def build_route_chain(user_lat: float, user_lon: float, valid_places: List[Dict], max_duration_min: float):
    current_lat, current_lon = user_lat, user_lon
    route = []
    total_duration_min = 0.0
    used_indices = set()

    for _ in range(5):
        if len(used_indices) >= len(valid_places):
            break

        result = await find_best_next_place(current_lat, current_lon, valid_places, used_indices)
        if result is None:
            break

        best_item, walk_min, walk_m = result
        visit_min = estimate_visit_duration(best_item["row"])
        new_total = total_duration_min + walk_min + visit_min

        if new_total > max_duration_min:
            break

        route.append({
            **best_item,
            "walk_min": walk_min,
            "walk_m": walk_m,
            "visit_min": visit_min
        })
        total_duration_min = new_total
        current_lat = best_item["row"]["lat"]
        current_lon = best_item["row"]["lon"]
        used_indices.add(best_item["index"])

    return route

async def generate_route_plan(interests: str, time_hours: float, user_lat: float, user_lon: float, df, embeddings, model):
    if time_hours <= 0 or time_hours > settings.MAX_WALK_TIME_HOURS:
        raise ValueError("Некорректное время")

    # семантический отбор
    user_embedding = model.encode([interests], convert_to_numpy=True)
    sims = cosine_similarity(user_embedding, embeddings).flatten()
    df_ranked = df.copy()
    df_ranked['similarity'] = sims
    df_ranked = df_ranked.sort_values('similarity', ascending=False).reset_index(drop=True)

    # грубая фильтрация
    MAX_WALK_KM = time_hours * 5.0
    df_ranked['est_dist_km'] = df_ranked.apply(
        lambda row: haversine_fast(user_lat, user_lon, row['lat'], row['lon']),
        axis=1
    )
    candidates = df_ranked[df_ranked['est_dist_km'] <= MAX_WALK_KM].head(20)
    if candidates.empty:
        raise ValueError("Нет объектов в радиусе")

    # ors от пользователя до каждой точки
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

    # построение маршрута
    route = await build_route_chain(user_lat, user_lon, valid_places, time_hours * 60)

    if not route:
        raise ValueError("Не удалось построить маршрут")

    # объяснования
    explanation_tasks = [
        explain_with_gigachat(
            interests,
            place["row"]["title"],
            place["row"]["description"] or ""
        )
        for place in route
    ]
    explanations = await asyncio.gather(*explanation_tasks)

    # формирование ответа
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