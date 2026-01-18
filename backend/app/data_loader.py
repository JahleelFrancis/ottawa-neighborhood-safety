import json
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "crime_2025.json"

def load_dataset():
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"[load_dataset] File not found: {DATA_PATH}")
        return None
    except Exception as e:
        print(f"[load_dataset] Failed to load dataset: {e}")
        return None
