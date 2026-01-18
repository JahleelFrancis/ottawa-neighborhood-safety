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
    map = L.map('map').setView([45.4215, -75.6972], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

// Load neighborhood data (from JSON or API)
async function loadNeighborhoods() {
    try {
        // Replace with actual data source
        const response = await fetch('./data/neighborhoods.json');
        neighborhoods = await response.json();
        renderMarkers();
    } catch (error) {
        console.error('Error loading neighborhoods:', error);
        // Fallback: use sample data
        neighborhoods = getSampleData();
        renderMarkers();
    }
}

// Render markers on map
function renderMarkers() {
    neighborhoods.forEach(neighborhood => {
        const color = getSafetyColor(neighborhood.safety_score);
        const marker = L.marker([neighborhood.lat, neighborhood.lng], {
            icon: L.divIcon({
                html: `<div class="marker-badge" style="background-color: ${color};">${neighborhood.safety_score}</div>`,
                className: 'safety-marker',
                iconSize: [40, 40]
            })
        }).addTo(map);
        
        marker.on('click', () => updateSidebar(neighborhood));
        markers[neighborhood.name] = marker;
    });
}

// Get color based on safety score
function getSafetyColor(score) {
    if (score > 4.0) return '#4CAF50'; // Green
    if (score > 2.5) return '#FF9800'; // Orange
    return '#F44336'; // Red
}

// Update sidebar with neighborhood details
function updateSidebar(neighborhood) {
    const titleEl = document.querySelector('#title');
    const contentEl = document.querySelector('#content');
    
    titleEl.textContent = neighborhood.name;
    contentEl.innerHTML = `
        <div class="safety-score">Safety Score: ${neighborhood.safety_score}/5</div>
        <div class="crime-stats">
            <p><strong>Incidents:</strong> ${neighborhood.crime_count} (last 30 days)</p>
            <p><strong>Most common:</strong> ${neighborhood.crime_types[0] || 'N/A'}</p>
        </div>
    `;
}

// Sample data for development
function getSampleData() {
    return [
        {
            name: 'Downtown Core',
            lat: 45.4215,
            lng: -75.6972,
            safety_score: 3.8,
            crime_count: 42,
            crime_types: ['property theft', 'assault']
        },
        {
            name: 'Byward Market',
            lat: 45.4265,
            lng: -75.6882,
            safety_score: 3.2,
            crime_count: 58,
            crime_types: ['theft', 'disturbance']
        },
        {
            name: 'Kanata',
            lat: 45.3150,
            lng: -75.7497,
            safety_score: 4.6,
            crime_count: 12,
            crime_types: ['minor vandalism']
        }
    ];
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);