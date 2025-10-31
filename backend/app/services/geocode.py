import httpx
import logging

logger = logging.getLogger(__name__)

async def geocode_address(address: str):
    
    normalized_address = normalize_address(address)
    
    coords = check_popular_places(normalized_address)
    if coords:
        return coords
    
    try:
        coords = await geocode_with_nominatim(normalized_address)
        if coords:
            return coords
    except Exception as e:
        logger.error("exception in geocode_with_nominatim")
    
    return (56.326887, 44.005986)

def normalize_address(address: str):
    
    address_lower = address.lower().strip()

    replacements = {
        "улица": "ул.",
        "ул ": "ул.",
        "проспект": "пр-т",
        "площадь": "пл.",
        "набережная": "наб."
    }
    
    for old, new in replacements.items():
        address_lower = address_lower.replace(old, new)
    
    return address_lower

def check_popular_places(address: str):
    popular_places = {
        "пл. минина": (56.3273, 44.0021),
        "площадь минина": (56.3273, 44.0021),
        "минина": (56.3273, 44.0021),
        "ул. большая покровская": (56.3186, 44.0033),
        "большая покровская": (56.3186, 44.0033),
        "покровская": (56.3186, 44.0033),
        "кремль": (56.3280, 44.0022),
        "нижегородский кремль": (56.3280, 44.0022),
        "ул. рождественская": (56.3291, 43.9873),
        "рождественская": (56.3291, 43.9873),
        "наб. волги": (56.3308, 43.9895),
        "набережная волги": (56.3308, 43.9895),
        "волжская наб.": (56.3308, 43.9895),
        "вокзал": (56.3217, 43.9367),
        "московский вокзал": (56.3217, 43.9367),
        "жд вокзал": (56.3217, 43.9367),
        "горьковская": (56.3217, 43.9367),
        "метро горьковская": (56.3217, 43.9367),
        "московская": (56.3128, 43.9456),
        "метро московская": (56.3128, 43.9456),
        "советский район": (56.314978, 44.047921),
        "нижегородский район": (56.326887, 44.005986),
        "приокский район": (56.314978, 44.047921),
    }
    
    for place, coords in popular_places.items():
        if place in address:
            return coords
    
    return None

async def geocode_with_nominatim(address: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{address}, Нижний Новгород, Россия",
        "format": "json",
        "limit": 1,
        "accept-language": "ru"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "User-Agent": "TouristApp/1.0 (contact@example.com)"
            }
            r = await client.get(url, params=params, headers=headers, timeout=10.0)
            r.raise_for_status()
            data = r.json()
            
            if data:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                return lat, lon
            
    except Exception as e:
        logger.error(f"error Nominatim for address \"{address}\": {e}")
    
    return None