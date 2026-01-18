from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timezone
from app.data_loader import load_dataset
from app.scoring import compute_score_and_risk
from fastapi.responses import FileResponse
from pathlib import Path


router = APIRouter()

MOCK_DATA = {
    "Centretown": {
        "score": 72,
        "risk_level": "Medium",
        "top_factors": [
            {"category": "Theft", "rate_per_1000": 14.2},
            {"category": "Break & Enter", "rate_per_1000": 6.1},
            {"category": "Mischief", "rate_per_1000": 9.4},
        ],
        "summary": "Most elevated categories are Theft and Mischief compared to Ottawa average.",
        "sources": ["Ottawa Police Service"],
    },
    "Kanata": {
        "score": 86,
        "risk_level": "Low",
        "top_factors": [
            {"category": "Theft", "rate_per_1000": 6.0},
            {"category": "Break & Enter", "rate_per_1000": 2.1},
            {"category": "Assault", "rate_per_1000": 1.8},
        ],
        "summary": "Overall lower incident rates compared to Ottawa average.",
        "sources": ["Ottawa Police Service"],
    },
}

def _get_neigh_map(data: dict):
    if not isinstance(data, dict):
        return None
    return data.get("neighbourhoods") or data.get("neighborhoods")


@router.get("/neighbourhoods")
def list_neighbourhoods():
    data = load_dataset()
    if isinstance(data, dict):
        neigh_map = _get_neigh_map(data)
        if isinstance(neigh_map, dict):
            return {"neighbourhoods": sorted(neigh_map.keys())}

    return {"neighbourhoods": sorted(MOCK_DATA.keys())}


@router.get("/report")
def get_report(
    neighbourhood: str | None = Query(None),
    neighborhood: str | None = Query(None),
):
    name = neighbourhood or neighborhood
    if not name:
        raise HTTPException(status_code=422, detail="Provide neighbourhood (or neighborhood)")

    data = load_dataset()
    if isinstance(data, dict):
        neigh_map = _get_neigh_map(data)
        if isinstance(neigh_map, dict):
            key = name.strip()

            match = next((k for k in neigh_map.keys() if k.lower() == key.lower()), None)
            if not match:
                raise HTTPException(status_code=404, detail="Neighbourhood not found")

            entry = neigh_map[match]
            counts = entry.get("counts", {}) or {}

            score, risk, top_factors = compute_score_and_risk(counts)

            year = (data.get("timeframe") or {}).get("reported_year")
            sources = entry.get("source_links") or (data.get("metadata") or {}).get("source_links", [])

            summary = f"Total reported incidents: {sum(counts.values())}" + (f" (year {year})." if year else ".")

            return {
                "neighbourhood": match,
                "year": year,
                "score": score,
                "risk_level": risk,
                "top_factors": top_factors,
                "counts": counts,
                "sources": sources,
                "summary": summary,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

    # fallback mock
    key = name.strip()
    match = next((k for k in MOCK_DATA.keys() if k.lower() == key.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail="Neighbourhood not found")

    stats = MOCK_DATA[match]
    return {
        "neighbourhood": match,
        "score": stats["score"],
        "risk_level": stats["risk_level"],
        "top_factors": stats["top_factors"],
        "summary": stats["summary"],
        "sources": stats["sources"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
