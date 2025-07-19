// Initiera Leaflet-kartan
const map = L.map('map').setView([59.3275, 14.5178], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const allMarkers = [];

// Hämta badplatser korrekt
fetch("https://badplatsen.havochvatten.se/badplatsregister/v1/badplatser")
  .then(res => res.json())
  .then(json => {
    // Om svaret ligger under json.badplatser
    const places = Array.isArray(json.badplatser) 
      ? json.badplatser 
      : json;

    places.forEach(plats => {
      // Hitta rätt fältnamn
      const lat = plats.latitude || plats.latitud;
      const lon = plats.longitude || plats.longitud;
      if (!lat || !lon) return; // hoppa om koordinater saknas

      // Skapa markör
      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        color: getColor(plats.eUklassning || plats.provtagningstatus),
        fillOpacity: 0.8
      }).addTo(map);

      // Spara för sök/filtrering
      marker.feature = { properties: plats };
      allMarkers.push(marker);

      // Pop-up med grundinfo
      marker.bindPopup(`
        <strong>${plats.namn}</strong><br>
        Klassning: ${plats.eUklassning || 'Ej tillgänglig'}<br>
        Län: ${plats.lanNamn || plats.lan?.lanNamn || '–'}<br>
        Kommun: ${plats.kommunNamn || plats.kommun?.kommunNamn || '–'}
      `);
    });
  })
  .catch(err => console.error("Fetch error:", err));

// Enkel färgsättning
function getColor(status) {
  if (status === "Utmärkt") return "green";
  if (status === "Bra") return "orange";
  if (status === "Tillfredsställande") return "yellow";
  return "red";
}

// Filtrering och sökning (oförändrad)
document.getElementById("accessFilter").addEventListener("change", e => {
  const val = e.target.value;
  allMarkers.forEach(m => {
    // Här kan du byta ut mot något API-fält, t.ex. m.feature.properties.badvattentyp
    m[val === "Alla" ? "addTo" : "removeLayer"](map);
  });
});

document.getElementById("searchBox").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  allMarkers.forEach(marker => {
    const namn = marker.feature.properties.namn.toLowerCase();
    (q === "" || namn.includes(q)) 
      ? marker.addTo(map) 
      : map.removeLayer(marker);
  });
});

