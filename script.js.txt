// Initiera Leaflet-kartan
const map = L.map('map').setView([59.3275, 14.5178], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Behåll referenser till alla markörer
const allMarkers = [];

// Hämta badplatser och plotta dem
fetch("badplatser.json")
  .then(res => res.json())
  .then(data => {
    data.forEach(plats => {
      const marker = L.circleMarker([plats.lat, plats.lon], {
        radius: 8,
        color: getColor(plats.kvalitet),
        fillOpacity: 0.8
      }).addTo(map);

      marker.feature = { properties: plats };

      marker.bindPopup(`
        <strong>${plats.namn}</strong><br>
        Kvalitet: ${plats.kvalitet}<br>
        E. coli: ${plats.eColi}<br>
        Enterokocker: ${plats.enterokocker}<br>
        Datum: ${plats.datum}<br>
        Tillgänglighet: ${plats.tillganglighet.join(", ")}
      `);

      allMarkers.push(marker);
    });
  });

// Färg beroende på kvalitet
function getColor(k) {
  if (k === "Utmärkt") return "green";
  if (k === "Bra") return "orange";
  if (k === "Tillfredsställande") return "yellow";
  return "red";
}

// Tillgänglighetsfilter
document.getElementById("accessFilter").addEventListener("change", e => {
  const val = e.target.value;
  allMarkers.forEach(marker => {
    const tags = marker.feature.properties.tillganglighet;
    (val === "Alla" || tags.includes(val)) 
      ? marker.addTo(map) 
      : map.removeLayer(marker);
  });
});

// Sökruta: filtrera på namn
document.getElementById("searchBox").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  allMarkers.forEach(marker => {
    const namn = marker.feature.properties.namn.toLowerCase();
    // Visa marker om sökningen är tom eller ingår i namnet
    (q === "" || namn.includes(q)) 
      ? marker.addTo(map) 
      : map.removeLayer(marker);
  });
});

// Temperaturgraf med Chart.js (oförändrad)
const ctx = document.getElementById('tempChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'],
    datasets: [{
      label: 'Vattentemperatur (°C)',
      data: [18.2, 19.1, 20.3, 21.0, 20.7],
      borderColor: '#00AEEF',
      borderWidth: 2,
      fill: false,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: false }
    }
  }
});
