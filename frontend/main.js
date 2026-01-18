// Initialize map and sidebar functionality
let map;
let neighborhoods = [];
let markers = {};

// Initialize the application
function init() {
  initMap();
  loadNeighborhoods();
}

// Initialize Leaflet map
function initMap() {
  map = L.map("map").setView([45.4215, -75.6972], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(map);
}

// Load neighborhood data (hardcoded demo data for hackathon)
async function loadNeighborhoods() {
  // Option A: always use demo data (recommended for demo stability)
  neighborhoods = getSampleData();
  renderMarkers();

  // If you REALLY want to keep the fetch for later, you can switch to this:
  /*
  try {
    const response = await fetch("./data/neighborhoods.json");
    neighborhoods = await response.json();
    renderMarkers();
  } catch (error) {
    console.error("Error loading neighborhoods:", error);
    neighborhoods = getSampleData();
    renderMarkers();
  }
  */
}

// Render markers on map
function renderMarkers() {
  // clear existing markers if re-rendering
  Object.values(markers).forEach((m) => map.removeLayer(m));
  markers = {};

  neighborhoods.forEach((neighborhood) => {
    const color = getSafetyColor(neighborhood.safety_score);

    const marker = L.marker([neighborhood.lat, neighborhood.lng], {
      icon: L.divIcon({
        html: `<div class="marker-badge" style="border-color:${color}; color:${color};">${neighborhood.safety_score.toFixed(
          1
        )}</div>`,
        className: "safety-marker",
        iconSize: [40, 40],
      }),
    }).addTo(map);

    marker.on("click", () => updateSidebar(neighborhood));
    markers[neighborhood.name] = marker;
  });
}

// Get color based on safety score
function getSafetyColor(score) {
  if (score > 4.0) return "#4CAF50"; // Green
  if (score > 2.5) return "#FF9800"; // Orange
  return "#F44336"; // Red
}

// Update sidebar with neighborhood details
function updateSidebar(neighborhood) {
  const titleEl = document.getElementById("title");
  const contentEl = document.getElementById("content");

  titleEl.textContent = neighborhood.name;
  contentEl.innerHTML = `
    <div class="safety-score">Safety Score: ${neighborhood.safety_score.toFixed(
      1
    )}/5</div>
    <div class="crime-stats">
      <p><strong>Incidents:</strong> ${neighborhood.crime_count} (last 30 days)</p>
      <p><strong>Most common:</strong> ${neighborhood.crime_types[0] || "N/A"}</p>
    </div>
  `;
}

// Hardcoded demo data (more neighborhoods so the map looks full)
function getSampleData() {
  return [
    { name: "Downtown Core", lat: 45.4215, lng: -75.6972, safety_score: 3.8, crime_count: 42, crime_types: ["property theft", "assault"] },
    { name: "ByWard Market", lat: 45.4297, lng: -75.6944, safety_score: 3.2, crime_count: 58, crime_types: ["theft", "disturbance"] },
    { name: "Centretown", lat: 45.4125, lng: -75.7022, safety_score: 3.9, crime_count: 31, crime_types: ["mischief", "theft"] },
    { name: "Sandy Hill", lat: 45.4321, lng: -75.6826, safety_score: 3.4, crime_count: 44, crime_types: ["theft", "assault"] },
    { name: "Lowertown", lat: 45.4336, lng: -75.6919, safety_score: 3.1, crime_count: 52, crime_types: ["theft", "mischief"] },

    { name: "The Glebe", lat: 45.4021, lng: -75.6829, safety_score: 4.5, crime_count: 14, crime_types: ["bike theft", "mischief"] },
    { name: "Old Ottawa South", lat: 45.3939, lng: -75.6735, safety_score: 4.4, crime_count: 16, crime_types: ["theft", "break & enter"] },
    { name: "Hintonburg", lat: 45.4048, lng: -75.7316, safety_score: 4.2, crime_count: 19, crime_types: ["theft", "mischief"] },
    { name: "Westboro", lat: 45.3934, lng: -75.7518, safety_score: 4.6, crime_count: 11, crime_types: ["break & enter", "theft"] },

    { name: "Vanier", lat: 45.4392, lng: -75.6480, safety_score: 3.4, crime_count: 47, crime_types: ["property theft", "assault"] },
    { name: "Overbrook", lat: 45.4340, lng: -75.6470, safety_score: 3.6, crime_count: 33, crime_types: ["theft", "mischief"] },
    { name: "Alta Vista", lat: 45.3850, lng: -75.6550, safety_score: 4.4, crime_count: 18, crime_types: ["vehicle theft", "fraud"] },
    { name: "Riverside South", lat: 45.2779, lng: -75.6940, safety_score: 4.7, crime_count: 9, crime_types: ["fraud", "mischief"] },

    { name: "Nepean", lat: 45.3349, lng: -75.7241, safety_score: 4.7, crime_count: 10, crime_types: ["fraud", "theft"] },
    { name: "Barrhaven", lat: 45.2735, lng: -75.7399, safety_score: 4.8, crime_count: 8, crime_types: ["mischief", "theft"] },
    { name: "Kanata", lat: 45.3150, lng: -75.7497, safety_score: 4.6, crime_count: 12, crime_types: ["minor vandalism"] },
    { name: "Orléans", lat: 45.4765, lng: -75.4980, safety_score: 4.6, crime_count: 13, crime_types: ["theft", "mischief"] },

    { name: "Gloucester", lat: 45.4210, lng: -75.5970, safety_score: 4.1, crime_count: 22, crime_types: ["theft", "vehicle theft"] },
    { name: "South Keys", lat: 45.3522, lng: -75.6483, safety_score: 3.7, crime_count: 28, crime_types: ["theft", "disturbance"] },
    { name: "Bayshore", lat: 45.3518, lng: -75.8063, safety_score: 3.3, crime_count: 40, crime_types: ["theft", "assault"] },
    { name: "Carlington", lat: 45.3842, lng: -75.7342, safety_score: 3.8, crime_count: 27, crime_types: ["mischief", "theft"] },
  ];
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", init);
