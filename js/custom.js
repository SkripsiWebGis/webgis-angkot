var map = L.map('map').setView([-7.3305, 110.5084], 13);

// Tambahkan Basemap
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var googleSat = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Satellite'
});

var googleMaps = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps'
});

var baseMaps = {
    "OpenStreetMap": osm,
    "Google Maps": googleMaps,
    "Google Satellite": googleSat
};
L.control.layers(baseMaps).addTo(map);

var allPolylines = [];
var activeLayer = null; // Menyimpan jalur aktif

// **1️⃣ Ambil daftar trayek dari file GeoJSON**
$.getJSON("geojson/trayek.geojson", function(data) {
    var dropdown = document.getElementById("trayekDropdownMenu"); // Ambil dropdown

    data.features.forEach(function(feature, index) {
        var trayekName = feature.properties.Trayek; // Ambil nama trayek dari GeoJSON
        var option = document.createElement("a"); 
        option.className = "dropdown-item";
        option.href = "#";
        option.innerText = trayekName;
        option.onclick = function() {
            tampilkanJalur(feature); // Panggil fungsi untuk menampilkan trayek
        };
        dropdown.appendChild(option); // Tambahkan ke dropdown
    });
});

// **2️⃣ Fungsi untuk menampilkan jalur trayek yang dipilih**
function tampilkanJalur(feature) {
    // Hapus jalur sebelumnya
    if (activeLayer) {
        map.removeLayer(activeLayer);
    }

    // Tampilkan trayek yang dipilih
    activeLayer = L.geoJSON(feature, {
        style: function (f) {
            return { color: f.properties.color, weight: 5 };
        }
    }).addTo(map);

    // Zoom ke trayek
    map.fitBounds(activeLayer.getBounds(), { padding: [20, 20], maxZoom: 18 });
}

// **3️⃣ Reset peta saat klik di luar trayek**
map.on('click', function() {
    if (activeLayer) {
        map.removeLayer(activeLayer);
        activeLayer = null;
    }
});
