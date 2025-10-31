import httpx
from typing import Optional, Tuple

ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions/foot-walking"

async def get_ors_walking_time(from_lat: float, from_lon: float, to_lat: float, to_lon: float, api_key: str, timeout: float = 10.0):
    url = ORS_BASE_URL
    headers = {"Authorization": api_key}
    coords = [[from_lon, from_lat], [to_lon, to_lat]]
    json_data = {"coordinates": coords}

    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(url, json=json_data, headers=headers, timeout=timeout)
            if r.status_code == 200:
                data = r.json()
                route = data["routes"][0]
                segment = route["segments"][0]
                return segment["duration"], segment["distance"]
    except Exception:
        pass
    return None