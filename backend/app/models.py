from pydantic import BaseModel
from typing import List

class Factor(BaseModel):
    category: str
    rate_per_1000: float

class SafetyReport(BaseModel):
    neighbourhood: str
    score: int
    risk_level: str
    top_factors: List[Factor]
    summary: str
    sources: List[str]
    timestamp: str
