from pathlib import Path
import json

def load_dataset():
    repo_root = Path(__file__).resolve().parents[2]  # backend/app -> backend -> repo root
    path = repo_root / "data" / "crime-by-neighborhood.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))

