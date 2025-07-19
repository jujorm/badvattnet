// 1. Initiera Leaflet-kartan (oförändrat)
const map = L.map('map').setView([59.3275, 14.5178], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. Hämta alla badplatser direkt från Havs- och vattenmyndigheten
fetch("https://badplatsen.havochvatten.se/badplatsregister/v1/badplatser")
  .then(res => res.json())
  .then(data => {
    // data är en array med alla badplatser
    data.forEach(plats => {
      // Skapa markör utifrån API-produkten
      const marker = L.circleMarker(
        [plats.latitude, plats.longitude], {
          radius: 6,
          color: getColor(plats.avloppsrordning), // Exempelproperty
          fillOpacity: 0.8
        }
      ).addTo(map);

      // Spara property för sökning/filtrering
      marker.feature = { properties: plats };

      // Popup med grundinfo
      marker.bindPopup(`
        <strong>${plats.badvattentyp}</strong><br>
        Namn: ${plats.namn}<br>
        Län: ${plats.lanNamn}<br>
        Kommun: ${plats.kommunNamn}<br>
        Övrigt: ${plats.eUklassning}
      `);
    });
  })
  .catch(err => console.error("Kunde inte hämta badplatser:", err));

// Exempel på färgsättning – justera efter API-fält
function getColor(status) {
  switch(status) {
    case "EU-badsplats": return "green";
    case "Kommunal": return "blue";
    default: return "gray";
  }
}

// Resten (filter, sök, temperaturgraf) behålls som tidigare...
