import httpx
import asyncio
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

GIGACHAT_API_KEY = settings.GIGACHAT_API_KEY
BASE_URL = "https://foundation-models.api.cloud.ru/v1"

def ask(prompt: str, model: str = "GigaChat/GigaChat-2-Max", max_tokens: int = 500, temperature: float = 0.3):
    try:
        response = httpx.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {GIGACHAT_API_KEY}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens,
                "top_p": 0.95,
                "presence_penalty": 0
            },
            timeout=30
        )

        if not response.is_success:
            logger.error(f"gigachat api error {response.status_code}: {response.text}")
            response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        logger.error(f"Error calling GigaChat: {e}")
        raise