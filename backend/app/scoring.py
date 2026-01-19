def compute_score_and_risk(counts: dict[str, int]) -> tuple[int, str, list[dict]]:
    """
    Turns raw crime counts into:
    - score: 0..100 (higher = worse)
    - risk_level: Low/Medium/High
    - top_factors: top 3 categories by count
    """
    total = sum(counts.values())

    # super simple score mapping (tweak later if you want)
    # 0 -> 0, 200 -> 50, 400 -> 100 (clamped)
    score = int((total / 400) * 100)
    score = max(0, min(100, score))

    if score < 34:
        risk = "Low"
    elif score < 67:
        risk = "Medium"
    else:
        risk = "High"

    top3 = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:3]
    top_factors = [{"category": name, "count": val} for name, val in top3]

    return score, risk, top_factors
