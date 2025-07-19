// Initiera karta
const map = L.map('map').setView([59.3275, 14.5178], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const allMarkers = [];
const dataUrl = "badplatser.json";  // Ändra till din API-URL om du kör dynamiskt

console.log("🔍 Hämtar data från:", dataUrl);

fetch(dataUrl)
  .then(res => {
    console.log("⬇️ Fetch-svar:", res.status, res.statusText);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(json => {
    // Om JSON är paketad under en nyckel, t.ex. json.badplatser:
    const places = Array.isArray(json) ? json : (json.badplatser || []);
    console.log("🗂️ Antal badplatser att plotta:", places.length);

    places.forEach(plats => {
      const lat = plats.lat || plats.latitude || plats.latitud;
      const lon = plats.lon || plats.longitude || plats.longitud;
      if (lat == null || lon == null) {
        console.warn("⚠️ Saknar koordinat för", plats);
        return;
      }

      const marker = L.circleMarker([lat, lon], {
        radius: 6,
        color: getColor(plats.eUklassning || plats.kvalitet),
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`
        <strong>${plats.namn}</strong><br>
        EU-klassning: ${plats.eUklassning || plats.kvalitet || '–'}<br>
        Län: ${plats.lanNamn || '–'}<br>
        Kommun: ${plats.kommunNamn || '–'}
      `);

      allMarkers.push(marker);
    });

    if (allMarkers.length === 0) {
      console.warn("🚫 Inga markörer skapades — kontrollera JSON-strukturen och fältnamn.");
    }
  })
  .catch(err => {
    console.error("❌ Kunde inte hämta eller bearbeta data:", err);
  });

// Exempel på färgsättning
function getColor(status) {
  if (status === "Utmärkt") return "green";
  if (status === "Bra") return "orange";
  return "red";
}

