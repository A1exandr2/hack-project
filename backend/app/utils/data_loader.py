import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
import re

def parse_coord(coord_str):
    if not coord_str or pd.isna(coord_str):
        return None, None

    matches = re.findall(r"[-+]?\d*\.\d+|\d+", str(coord_str))
    if len(matches) >= 2:
        try:
            lon = float(matches[0])
            lat = float(matches[1])
            return lat, lon
        except (ValueError, IndexError):
            pass
    return None, None

def load_and_prepare_data():
    from app.core.config import settings
    df = pd.read_csv(settings.CSV_PATH)
    df[['lat', 'lon']] = df['coordinate'].apply(lambda x: pd.Series(parse_coord(x)))
    df = df.dropna(subset=['lat', 'lon']).reset_index(drop=True)

    model = SentenceTransformer(settings.MODEL_NAME)
    df['text'] = (
    df['title'].fillna('').astype(str).str.strip() + 
    '. ' + 
    df['description'].fillna('').astype(str).str.strip()
    )

    df = df[df['text'].str.replace('. ', '').str.strip() != '']
    embeddings = model.encode(df['text'].tolist(), convert_to_numpy=True)
    embeddings = np.nan_to_num(embeddings, nan=0.0)

    return df, embeddings, model