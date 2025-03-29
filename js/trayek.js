// Fungsi untuk generate warna acak
function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Inisialisasi peta
let initialZoom = window.innerWidth < 768 ? 12 : 13;
var map = L.map('map').setView([-7.3305, 110.5084], initialZoom);

// Tambahkan basemap
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

// Variabel penting
var allPolylines = [];
var clickedPolyline = null;
var initialView = {
    center: [-7.3340836124184134, 110.5015472204637],
    zoom: 13
};

// Load semua jalur saat halaman pertama kali dibuka
$.getJSON("geojson/angkotbiru.geojson", function(data) {
    L.geoJSON(data, {
        style: function (feature) {
            return { color: getTrayekColor(feature.properties.Trayek), weight: 5 };
        },
        onEachFeature: function(feature, layer) {
            allPolylines.push(layer);

            layer.bindPopup("Nama jalur: " + feature.properties.Trayek);

            layer.on('click', function(e) {
                e.originalEvent.stopPropagation();

                allPolylines.forEach(poly => {
                    if (poly !== layer) map.removeLayer(poly);
                });

                map.addLayer(layer);
                map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 18 });

                clickedPolyline = layer;
            });
        }
    }).addTo(map);
});

// Reset tampilan saat klik di luar jalur
map.on('click', function() {
    resetPeta();
});

// Fungsi reset peta
function resetPeta() {
    allPolylines.forEach(poly => map.removeLayer(poly));
    allPolylines = [];

    $.getJSON("geojson/angkotbiru.geojson", function(data) {
        L.geoJSON(data, {
            style: function (feature) {
                return { color: getTrayekColor(feature.properties.Trayek), weight: 5 };
            },
            onEachFeature: function(feature, layer) {
                allPolylines.push(layer);

                layer.bindPopup("Nama jalur: " + feature.properties.Trayek);

                layer.on('click', function(e) {
                    e.originalEvent.stopPropagation();

                    allPolylines.forEach(poly => {
                        if (poly !== layer) map.removeLayer(poly);
                    });

                    map.addLayer(layer);
                    map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 18 });

                    clickedPolyline = layer;
                });
            }
        }).addTo(map);
        let resetZoom = window.innerWidth < 768 ? 12 : 13;
        map.setView(initialView.center, resetZoom);
    });
}

// Fungsi saat trayek dipilih dari dropdown manual
function tampilkanJalurDariNavbar(namaTrayek) {
    allPolylines.forEach(poly => map.removeLayer(poly));
    allPolylines = [];

    $.getJSON("geojson/angkotbiru.geojson", function(data) {
        var filteredFeatures = data.features.filter(feature => feature.properties.Trayek == namaTrayek);

        if (filteredFeatures.length === 0) {
            console.warn("Trayek tidak ditemukan:", namaTrayek);
            return;
        }

        var layer = L.geoJSON(filteredFeatures, {
            style: function (feature) {
                return { color: getTrayekColor(feature.properties.Trayek), weight: 5 };
            }
        }).addTo(map);

        allPolylines.push(layer);
        map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 18 });
    });
}
function getTrayekColor(trayekId) {
    let stored = localStorage.getItem("trayekColors");
    let colors = stored ? JSON.parse(stored) : {};

    // Kalau belum ada warna untuk trayek ini, generate
    if (!colors[trayekId]) {
        colors[trayekId] = getRandomColor();
        localStorage.setItem("trayekColors", JSON.stringify(colors));
    }

    return colors[trayekId];
}

function buatLegendaOtodidak() {
    $.getJSON("geojson/angkotbiru.geojson", function(data) {
        let trayekUnik = new Set();
        let legendList = document.getElementById("legend-list");
        legendList.innerHTML = "";

        data.features.forEach(feature => {
            let trayek = feature.properties.Trayek;

            if (!trayekUnik.has(trayek)) {
                trayekUnik.add(trayek);

                let warna = getTrayekColor(trayek);
                let item = document.createElement("li");
                item.innerHTML = `
                    <span style="display:inline-block;width:16px;height:16px;background:${warna};margin-right:8px;border-radius:2px;"></span>
                    ${trayek}
                `;
                legendList.appendChild(item);
            }
        });
    });
}

function toggleLegend() {
    var body = document.getElementById("legendBody");
    body.style.display = (body.style.display === "none") ? "block" : "none";
  }

  function toggleLegend() {
    const body = document.getElementById("legendBody");
    if (body.style.display === "none") {
      body.style.display = "block";
    } else {
      body.style.display = "none";
    }
  }
  
