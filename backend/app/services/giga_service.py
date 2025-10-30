import httpx
import logging
from typing import Optional, List

logger = logging.getLogger(__name__)

class GigaChatService:
    def __init__(self, api_key: str):
        self.base_url = "https://foundation-models.api.cloud.ru/v1"
        self.api_key = api_key
        self.logger = logging.getLogger(__name__)

    def ask(
        self,
        prompt: str,
        model: str = "GigaChat/GigaChat-2-Max",
        max_tokens: int = 500,
        temperature: float = 0.3
    ) -> str:
        self.logger.info("Sending request to GigaChat via Cloud.ru")
        
        try:
            response = httpx.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
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
                self.logger.error(f"Cloud.ru API error {response.status_code}: {response.text}")
                response.raise_for_status()

            data = response.json()
            content = data["choices"][0]["message"]["content"]
            self.logger.info("GigaChat response received")
            return content.strip()

        except Exception as e:
            self.logger.error(f"Error calling Cloud.ru GigaChat: {e}")
            raise

    def get_embedding(self, texts: List[str], model: str = "ai-sage/Giga-Embeddings-instruct") -> List[List[float]]:
        self.logger.info("Generating embeddings via Cloud.ru")
        
        try:
            response = httpx.post(
                f"{self.base_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "input": texts
                },
                timeout=30
            )

            if not response.is_success:
                self.logger.error(f"Embedding API error {response.status_code}: {response.text}")
                response.raise_for_status()

            data = response.json()
            embeddings = [item["embedding"] for item in data["data"]]
            self.logger.info(f"Received {len(embeddings)} embeddings")
            return embeddings

        except Exception as e:
            self.logger.error(f"Error generating embeddings: {e}")
            raise