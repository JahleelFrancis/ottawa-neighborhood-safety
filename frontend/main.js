// Initialize map and sidebar functionality
let map;
let neighborhoods = [];
let markers = {};
let selectedName = null;

// ---------- Init ----------
function init() {
  initMap();
  loadNeighborhoods();
  wireSearch();
}

// Initialize Leaflet map
function initMap() {
  map = L.map("map").setView([45.4215, -75.6972], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);
}

// Load neighborhood data (from JSON or fallback)
async function loadNeighborhoods() {
  try {
    const response = await fetch("./data/neighborhoods.json");
    neighborhoods = await response.json();
    renderMarkers();
  } catch (error) {
    console.error("Error loading neighborhoods:", error);
    neighborhoods = getSampleData();
    renderMarkers();
  }
}

// ---------- Helpers ----------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(str) {
  return (str || "").toLowerCase().trim();
}

function titleCase(str) {
  if (!str) return "";
  return str
    .toString()
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function getVerdict(score) {
  const s = Number(score);
  if (s >= 4.3) return { label: "Good Choice", tone: "good" };
  if (s >= 3.0) return { label: "Use Caution", tone: "caution" };
  return { label: "Higher Risk Area", tone: "bad" };
}

function getProsWatchouts(neighborhood) {
  const score = Number(neighborhood.safety_score);
  const crimes = Array.isArray(neighborhood.crime_types) ? neighborhood.crime_types : [];
  const mostCommon = crimes[0] ? titleCase(crimes[0]) : "N/A";

  const pros = [];
  const watchouts = [];

  if (score >= 4.3) {
    pros.push("Generally lower incident levels");
    pros.push("Strong option for families and daily routines");
    watchouts.push("Stay aware at night and near busier streets");
    if (mostCommon !== "N/A") watchouts.push(`${mostCommon} can still occur in pockets`);
  } else if (score >= 3.0) {
    pros.push("Mixed but workable depending on the street");
    pros.push("Better in busy, well-lit areas");
    watchouts.push("Use extra caution after dark");
    if (mostCommon !== "N/A") watchouts.push(`Watch for ${mostCommon}`);
  } else {
    pros.push("Can be fine in daytime with awareness");
    pros.push("Stick to main routes and higher-traffic areas");
    watchouts.push("Higher incident density overall");
    if (mostCommon !== "N/A") watchouts.push(`${mostCommon} is more common here`);
  }

  return { pros, watchouts, mostCommon };
}

function generateAreaOverview(neighborhood) {
  const score = Number(neighborhood.safety_score) || 0;
  const incidents = Number(neighborhood.crime_count) || 0;
  const crimes = Array.isArray(neighborhood.crime_types) ? neighborhood.crime_types : [];
  const commonCrime = crimes[0] ? titleCase(crimes[0]) : "General Incidents";

  if (score >= 4.5 && incidents <= 20) {
    return `This area is generally a strong pick for safety-focused living. Recent incident levels are relatively low, and the most common issue is ${commonCrime}. Great for families, students, and day-to-day routines.`;
  }
  if (score >= 4.0) {
    return `This neighborhood scores well overall and is a solid option for most people. Incidents do occur, often involving ${commonCrime}, but risk is typically manageable with normal precautions.`;
  }
  if (score >= 3.0) {
    return `This area is a mixed option: safety is moderate and incidents are more frequent. ${commonCrime} shows up often, so it’s best to stay aware at night and in low-traffic spots.`;
  }
  return `This area appears higher-risk based on recent incident patterns. ${commonCrime} is a frequent concern, and it may be a less ideal choice for those prioritizing safety—especially after dark.`;
}

function getSafetyClass(score) {
  const s = Number(score);
  if (s > 4.0) return "high";
  if (s > 2.5) return "medium";
  return "low";
}

function buildMarkerIcon(score, isSelected) {
  const cls = getSafetyClass(score);
  const selectedCls = isSelected ? " selected" : "";
  return L.divIcon({
    html: `<div class="marker-badge ${cls}${selectedCls}">${Number(score).toFixed(1)}</div>`,
    className: "safety-marker",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

// ---------- Render + Selection ----------
function renderMarkers() {
  // clear existing markers if re-rendering
  Object.values(markers).forEach((m) => {
    try { map.removeLayer(m); } catch (_) {}
  });
  markers = {};
  selectedName = null;

  neighborhoods.forEach((neighborhood) => {
    const marker = L.marker([neighborhood.lat, neighborhood.lng], {
      icon: buildMarkerIcon(neighborhood.safety_score, false),
    }).addTo(map);

    marker.on("click", () => onSelectNeighborhood(neighborhood));
    markers[neighborhood.name] = marker;
  });

  // auto-select first entry
  if (neighborhoods.length > 0) {
    onSelectNeighborhood(neighborhoods[0]);
  }
}

function onSelectNeighborhood(neighborhood) {
  // Unselect previous marker
  if (selectedName && markers[selectedName]) {
    const prevMarker = markers[selectedName];
    const prev = neighborhoods.find((n) => n.name === selectedName);
    if (prev) prevMarker.setIcon(buildMarkerIcon(prev.safety_score, false));
    prevMarker.setZIndexOffset(0);
  }

  // Select new marker
  selectedName = neighborhood.name;
  const marker = markers[selectedName];
  if (marker) {
    marker.setIcon(buildMarkerIcon(neighborhood.safety_score, true));
    marker.setZIndexOffset(1000);
  }

  updateSidebar(neighborhood);
}

function updateSidebar(neighborhood) {
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");

  const score = Number(neighborhood.safety_score);
  const scoreFixed = clamp(score, 0, 5).toFixed(1);

  const verdict = getVerdict(score);
  const { pros, watchouts, mostCommon } = getProsWatchouts(neighborhood);
  const overview = generateAreaOverview(neighborhood);

  titleEl.textContent = neighborhood.name;

  contentEl.innerHTML = `
    <div class="safety-score">
      Safety Score: ${scoreFixed}/5
    </div>

    <div class="verdict ${verdict.tone}">
      <span class="verdict-dot ${verdict.tone}"></span>
      <span class="verdict-text">${verdict.label}</span>
    </div>

    <div class="crime-stats">
      <p><strong>Incidents:</strong> ${neighborhood.crime_count} (last 30 days)</p>
      <p><strong>Most Common:</strong> ${mostCommon || "N/A"}</p>
    </div>

    <div class="overview-card">
      <div class="overview-title">Area Overview</div>
      <p class="overview-paragraph">${overview}</p>

      <div class="overview-grid">
        <div class="overview-col">
          <div class="overview-subtitle">Pros</div>
          <ul class="overview-list">
            ${pros.map((p) => `<li>${p}</li>`).join("")}
          </ul>
        </div>

        <div class="overview-col">
          <div class="overview-subtitle">Watch-outs</div>
          <ul class="overview-list">
            ${watchouts.map((w) => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>
  `;
}

// ---------- Search ----------
function wireSearch() {
  const input = document.getElementById("search");
  if (!input) return;

  input.addEventListener("input", (e) => {
    applySearchFilter(e.target.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = normalize(input.value);
    if (!q) return;

    const match = neighborhoods.find((n) => normalize(n.name).includes(q));
    if (match) onSelectNeighborhood(match);
  });
}

function applySearchFilter(query) {
  const q = normalize(query);

  // show all if empty
  if (!q) {
    Object.values(markers).forEach((m) => {
      const el = m.getElement();
      if (el) el.style.display = "";
    });
    return;
  }

  Object.entries(markers).forEach(([name, marker]) => {
    const el = marker.getElement();
    if (!el) return;
    el.style.display = normalize(name).includes(q) ? "" : "none";
  });
}

// ---------- Sample Data (demo) ----------
function getSampleData() {
  return [
    { name: "Downtown Core", lat: 45.4215, lng: -75.6972, safety_score: 3.8, crime_count: 42, crime_types: ["property theft", "assault"] },
    { name: "ByWard Market", lat: 45.4265, lng: -75.6882, safety_score: 3.2, crime_count: 58, crime_types: ["theft", "disturbance"] },
    { name: "Centretown", lat: 45.4136, lng: -75.7009, safety_score: 3.9, crime_count: 49, crime_types: ["theft", "mischief"] },
    { name: "Sandy Hill", lat: 45.4310, lng: -75.6780, safety_score: 3.4, crime_count: 36, crime_types: ["theft"] },
    { name: "Vanier", lat: 45.4390, lng: -75.6530, safety_score: 3.6, crime_count: 40, crime_types: ["break and enter"] },
    { name: "The Glebe", lat: 45.3996, lng: -75.6886, safety_score: 4.2, crime_count: 18, crime_types: ["vehicle theft"] },
    { name: "Westboro", lat: 45.3930, lng: -75.7530, safety_score: 4.6, crime_count: 14, crime_types: ["minor vandalism"] },
    { name: "Orleans", lat: 45.4780, lng: -75.5320, safety_score: 4.1, crime_count: 16, crime_types: ["vehicle theft"] },
    { name: "Nepean", lat: 45.3450, lng: -75.7600, safety_score: 3.8, crime_count: 26, crime_types: ["property theft"] },
    { name: "South Keys", lat: 45.3520, lng: -75.6470, safety_score: 3.7, crime_count: 31, crime_types: ["theft"] },
    { name: "Kanata", lat: 45.3150, lng: -75.7497, safety_score: 4.6, crime_count: 12, crime_types: ["minor vandalism"] },
    { name: "Barrhaven", lat: 45.2735, lng: -75.7399, safety_score: 4.7, crime_count: 10, crime_types: ["fraud"] },
  ];
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", init);
