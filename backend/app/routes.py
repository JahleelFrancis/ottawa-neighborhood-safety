from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timezone
from app.data_loader import load_dataset
from app.scoring import compute_score_and_risk


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

def get_data_source():
    data = load_dataset()
    if data is None:
        return None
    return data

@router.get("/neighbourhoods")
def list_neighbourhoods():
    data = load_dataset()
    print("DEBUG load_dataset type:", type(data))
    print("DEBUG load_dataset keys:", (list(data.keys()) if isinstance(data, dict) else data))

    if data and "neighbourhoods" in data:
        return {"neighbourhoods": sorted(data["neighbourhoods"].keys())}

    return {"neighbourhoods": sorted(MOCK_DATA.keys())}



@router.get("/report")
def get_report(neighbourhood: str = Query(...)):
    data = load_dataset()

    # ---------- JSON path ----------
    if data and "neighbourhoods" in data:
        neigh_map = data["neighbourhoods"]
        key = neighbourhood.strip()

        # case-insensitive match
        match = next((k for k in neigh_map.keys() if k.lower() == key.lower()), None)
        if not match:
            raise HTTPException(status_code=404, detail="Neighbourhood not found")

        entry = neigh_map[match]
        counts = entry.get("counts", {})

        score, risk, top_factors = compute_score_and_risk(counts)

        year = data.get("timeframe", {}).get("reported_year")
        sources = entry.get("source_links") or data.get("metadata", {}).get("source_links", [])

        summary = f"Total reported incidents: {sum(counts.values())} (year {year})." if year else \
                  f"Total reported incidents: {sum(counts.values())}."

        return {
            "neighbourhood": match,
            "year": year,
            "score": score,
            "risk_level": risk,
            "top_factors": top_factors,
            "counts": counts,            # <- include raw counts (useful for frontend charts)
            "sources": sources,
            "summary": summary,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # ---------- fallback mock ----------
    key = neighbourhood.strip()
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


