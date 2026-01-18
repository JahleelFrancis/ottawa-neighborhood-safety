<<<<<<< HEAD
# ottawa-neighborhood-safety
=======
# Ottawa Neighbourhood Safety Analysis

A data-driven safety analysis tool that extracts and analyzes Ottawa neighbourhood crime data using the **Yellowcake API** to generate structured, interpretable insights.

Built for a hackathon focused on web data extraction and AI-powered analysis.

---

## What This Does

Using official Ottawa Police crime data, the system:

- Identifies the safest neighbourhoods
- Flags neighbourhoods with unusually high violent crime
- Highlights notable crime patterns or anomalies
- Produces a concise city-wide crime overview

All outputs are returned as **structured JSON** for easy downstream use.

---

## Data Source

- Ottawa Police Service public Crime Map (ArcGIS)
- Underlying ArcGIS REST FeatureServer endpoints discovered via Yellowcake
- Reported crime incidents aggregated by:
  - Neighbourhood
  - Crime category
  - Year (2025)

---

## Role of Yellowcake

Yellowcake is used for **both discovery and analysis**:

### 1. Endpoint Discovery
Yellowcake analyzes the public ArcGIS Experience page to:
- Extract hidden REST FeatureServer URLs
- Identify relevant data layers and fields

This avoids hardcoding endpoints and ensures reliable data access.

### 2. Crime Insight Extraction
After crime data is normalized into JSON, Yellowcake performs structured analysis to return:

- `safest_neighbourhoods`
- `high_violent_crime_neighbourhoods`
- `notable_patterns`
- `citywide_overview`

All responses are machine-readable JSON.

---
>>>>>>> origin/backend-api
