from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timezone

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

@router.get("/neighbourhoods")
def list_neighbourhoods():
    return {"neighbourhoods": sorted(MOCK_DATA.keys())}

@router.get("/report")
def get_report(neighbourhood: str = Query(...)):
    key = neighbourhood.strip()

    if key not in MOCK_DATA:
        match = next((k for k in MOCK_DATA if k.lower() == key.lower()), None)
        if not match:
            raise HTTPException(status_code=404, detail="Neighbourhood not found")
        key = match

    data = MOCK_DATA[key]

    return {
        "neighbourhood": key,
        "score": data["score"],
        "risk_level": data["risk_level"],
        "top_factors": data["top_factors"],
        "summary": data["summary"],
        "sources": data["sources"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
