from app.utils.routing import get_ors_walking_time
from app.core.config import settings

@router.get("/test-ors")
async def test_ors():
    res = await get_ors_walking_time(
        56.331576, 44.003277,
        56.328943, 44.001157,
        settings.ORS_API_KEY
    )
    return {"result": res}