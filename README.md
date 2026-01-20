# 🗺️ Ottawa Neighbourhood Safety Map

An interactive web application that visualizes neighbourhood safety scores across Ottawa using an interactive map.  
Built as a **team project during uOttahack 8**, combining a FastAPI backend with a lightweight JavaScript frontend.

---

## 🚀 Features

-  Interactive map with clickable neighbourhood markers  
-  Safety scores (0–5) derived from crime statistics  
-  Search functionality for neighbourhoods  
-  Color-coded risk levels  
  - 🟢 Low Risk  
  - 🟠 Medium Risk  
  - 🔴 Higher Risk  
-  Area overview summaries for each neighbourhood  
-  Responsive layout with collapsible sidebar and map legend  

---

## 🛠️ Tech Stack

### Frontend
- Vanilla JavaScript
- HTML / CSS
- Leaflet.js (OpenStreetMap)

### Backend
- Python
- FastAPI
- RESTful API design

### Tooling
- Git & GitHub (branching, collaboration, conflict resolution)

---

## 📂 Project Structure

```text
ottawa-neighborhood-safety/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes.py
│   │   ├── scoring.py
│   │   └── data_loader.py
│   └── .venv/
├── frontend/
│   ├── index.html
│   ├── main.js
│   └── style.css
├── data/
│   └── crime-by-neighborhood.json
└── README.md
```
---
## 🧠 How It Works
1. Crime data is loaded and processed by the FastAPI backend
2. Crime data is loaded and processed by the FastAPI backend
3. The backend exposes REST endpoints for neighbourhood data and reports
4. The frontend fetches this data and renders:
  - Map markers
  - Sidebar statistics
  - Area overview summaries
5. Area overview summaries
--
## 👥 Team Project
This project was developed collaboratively during uOttahack under time constraints.

Key takeaways:

- Frontend–backend integration under pressure

- GitHub collaboration using feature branches

- Debugging merge conflicts and environment issues

- Shipping a polished, demo-ready product
--
## 🚧 Future Improvements
- Real-time crime data ingestion

- Neighbourhood boundary overlays (GeoJSON)

- Filtering by crime type or timeframe

- Cloud deployment (Docker / Vercel / Fly.io)

- User-defined safety preferences
