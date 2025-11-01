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

async def find_best_next_place(current_lat: float, current_lon: float, candidates: List[Dict], used_titles: set):
    best_item = None
    best_walk_min = float('inf')

    for place in candidates:
        if place["title"] in used_titles:
            continue

        res = await get_ors_walking_time(
            current_lat, current_lon,
            place["lat"], place["lon"],
            settings.ORS_API_KEY
        )
        if res is None:
            est_dist_km = haversine_fast(current_lat, current_lon, place["lat"], place["lon"])
            walk_min = (est_dist_km / 5.0) * 60
        else:
            walk_min = res[0] / 60

        if walk_min < best_walk_min:
            best_walk_min = walk_min
            best_item = place

    if best_item is None:
        return None
    return best_item, best_walk_min

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

async def build_route_chain(user_lat: float, user_lon: float, places: List[Dict], max_duration_min: float):
    current_lat, current_lon = user_lat, user_lon
    route = []
    total_duration_min = 0.0
    used_titles = set()

    for _ in range(5):
        if len(used_titles) >= len(places):
            break

        result = await find_best_next_place(current_lat, current_lon, places, used_titles)
        if result is None:
            break

        best_place, walk_min = result
        visit_min = estimate_visit_duration(best_place)
        new_total = total_duration_min + walk_min + visit_min

        if new_total > max_duration_min:
            break

        route.append({
            "place": best_place,
            "walk_min": walk_min,
            "visit_min": visit_min
        })
        total_duration_min = new_total
        current_lat = best_place["lat"]
        current_lon = best_place["lon"]
        used_titles.add(best_place["title"])

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
    
    places_list = candidates.to_dict('records')
    route = await build_route_chain(user_lat, user_lon, places_list, time_hours * 60)

    if not route:
        raise ValueError("Не удалось построить маршрут")

    # обоснования
    explanation_tasks = [
        explain_with_gigachat(
            interests,
            step["place"]["title"],
            step["place"].get("description", "") or ""
        )
        for step in route
    ]
    explanations = await asyncio.gather(*explanation_tasks)

    # формирование ответа
    plan = []
    total_walking_min = 0.0
    total_visit_min = 0.0

    for i, step in enumerate(route):
        place = step["place"]
        plan.append({
            "title": str(place["title"]),
            "why": explanations[i],
            "walking_time_min": round(step["walk_min"], 1),
            "visit_duration_min": step["visit_min"],
            "lat": float(place["lat"]),
            "lon": float(place["lon"])
        })
        total_walking_min += step["walk_min"]
        total_visit_min += step["visit_min"]

    total_duration_hours = (total_walking_min + total_visit_min) / 60

    return {
        "summary": {
            "total_places": len(plan),
            "total_walking_time_min": round(total_walking_min, 1),
            "total_duration_hours": round(total_duration_hours, 1)
        },
        "plan": plan
    }