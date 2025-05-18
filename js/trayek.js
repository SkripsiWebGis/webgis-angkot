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
// ID trayek yang mau di-hide saat load awal
const trayekDisembunyikan = [10, 13, 14, 15];

$.getJSON("geojson/angkotbiru.geojson", function(data) {
    L.geoJSON(data, {
        filter: function(feature) {
            return !trayekDisembunyikan.includes(parseInt(feature.properties.Trayek));
        },
        style: function (feature) {
            return { color: feature.properties.warna || "#000000", weight: 5 };
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

function resetPeta() {
    allPolylines.forEach(poly => map.removeLayer(poly));
    allPolylines = [];

    $.getJSON("geojson/angkotbiru.geojson", function(data) {
        L.geoJSON(data, {
            filter: function(feature) {
                return !trayekDisembunyikan.includes(parseInt(feature.properties.Trayek));
            },
            style: function (feature) {
                return { color: feature.properties.warna || "#000000", weight: 5 };
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

// Tambahkan wilayah yang tidak terjangkau angkot
    $.getJSON("geojson/wilayah-luar.geojson", function(wilayah) {
        L.geoJSON(wilayah, {
            style: {
            color: "#ff0000",        // biru
            fillColor: "#ff0000",    // biru
            fillOpacity: 0.25,
            weight: 1,
            dashArray: '4'
        }
    }).addTo(map).bindPopup("Wilayah di luar jangkauan angkot");
});


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

        let status = filteredFeatures[0].properties.status;
        if (status && status.toLowerCase() === "nonaktif") {
            tampilkanPeringatan("Jalur ini tidak beroperasi");
        }

        var layer = L.geoJSON(filteredFeatures, {
            style: function (feature) {
                return { color: feature.properties.warna || "#000000", weight: 5 };
            },
            onEachFeature: function(feature, layer) {
                const popupContent = "Nama jalur: " + feature.properties.Trayek;
                layer.bindPopup(popupContent);

                // Munculkan popup di tengah jalur
                setTimeout(() => {
                    layer.openPopup(layer.getBounds().getCenter());
                }, 200); // sedikit delay supaya pasti setelah layer nempel di peta
            }
        }).addTo(map);

        allPolylines.push(layer);
        map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 18 });
    });
}

function buatLegendaOtodidak() {
    $.getJSON("geojson/angkotbiru.geojson", function(data) {
        let trayekMap = new Map();
        let legendList = document.getElementById("legend-list");
        legendList.innerHTML = "";

        // Cari trayek unik dan ambil warna dari feature pertama
        data.features.forEach(feature => {
            let trayek = feature.properties.Trayek;
            let warna = feature.properties.warna || "#000000";

            if (!trayekMap.has(trayek)) {
                trayekMap.set(trayek, warna);
            }
        });

        // Buat elemen legenda dari Map
        trayekMap.forEach((warna, trayek) => {
            let item = document.createElement("li");
            item.innerHTML = ` 
                <span style="display:inline-block;width:16px;height:16px;background:${warna};margin-right:8px;border-radius:2px;"></span>
                ${trayek}
            `;

            item.addEventListener("click", function() {
                // Highlight trayek saat item legenda diklik
                highlightJalur(trayek);
            });

            legendList.appendChild(item);
        });
    });
}

// Fungsi untuk highlight jalur berdasarkan trayek
function highlightJalur(namaTrayek) {
    // Sembunyikan semua jalur terlebih dahulu
    allPolylines.forEach(poly => map.removeLayer(poly));
    allPolylines = [];

    // Filter jalur yang sesuai dengan nama trayek
    $.getJSON("geojson/angkotbiru.geojson", function(data) {
        var filteredFeatures = data.features.filter(feature => feature.properties.Trayek == namaTrayek);

        if (filteredFeatures.length === 0) {
            console.warn("Trayek tidak ditemukan:", namaTrayek);
            return;
        }

        let status = filteredFeatures[0].properties.status;
        if (status && status.toLowerCase() === "nonaktif") {
            tampilkanPeringatan("Jalur ini tidak beroperasi");
        }

        var layer = L.geoJSON(filteredFeatures, {
            style: function (feature) {
                return { color: feature.properties.warna || "#000000", weight: 5 };
            },
            onEachFeature: function(feature, layer) {
                const isi = "Nama jalur: " + feature.properties.Trayek;
                layer.bindPopup(isi);

                // Buka popup langsung di tengah garis
                setTimeout(() => {
                    layer.openPopup(layer.getBounds().getCenter());
                }, 200);
            }
        }).addTo(map);

        allPolylines.push(layer);
        map.fitBounds(layer.getBounds(), { padding: [20, 20], maxZoom: 18 });
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
  
  document.addEventListener("DOMContentLoaded", function () {
    // Cek apakah user sudah pernah melihat banner
    if (!localStorage.getItem("bannerShown")) {
        document.getElementById("warning-banner").style.display = "block";
    }

    // Event untuk menutup banner
    document.getElementById("close-banner").addEventListener("click", function () {
        document.getElementById("warning-banner").style.display = "none";
        localStorage.setItem("bannerShown", "true"); // Simpan di localStorage agar tidak muncul lagi
    });
});

function tampilkanPeringatan(pesan) {
    document.getElementById("popupPeringatan").style.display = "flex";
}

function tutupPeringatan() {
    document.getElementById("popupPeringatan").style.display = "none";
}