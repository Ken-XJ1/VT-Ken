const DISEASE_COLORS = {
    dengue: '#e74c3c',
    malaria: '#8e44ad',
    zika: '#f39c12',
    chikungunya: '#3498db',
};

const DISEASE_SLUG = {
    Dengue: 'dengue',
    Malaria: 'malaria',
    Zika: 'zika',
    Chikungunya: 'chikungunya',
};

const CHOCO_CENTER = [5.42, -76.67];
const DEFAULT_ZOOM = 9;

let map;
let markersLayer;
let heatLayer;
let allBrotes = [];
let heatEnabled = false;
let selectedMunicipio = '';
let selectedEnfermedad = '';

function diseaseColor(name) {
    const slug = DISEASE_SLUG[name] || 'dengue';
    return DISEASE_COLORS[slug];
}

function createMarkerIcon(color) {
    return L.divIcon({
        className: 'brote-marker',
        html: `<span style="
            display:block;width:14px;height:14px;
            background:${color};border:2px solid #fff;
            border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5);
        "></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function initMap() {
    map = L.map('map', { scrollWheelZoom: true }).setView(CHOCO_CENTER, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap, &copy; CARTO',
        maxZoom: 18,
    }).addTo(map);
    markersLayer = L.layerGroup().addTo(map);
}

function renderMarkers(brotes) {
    markersLayer.clearLayers();
    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }

    brotes.forEach((b) => {
        const color = diseaseColor(b.enfermedad);
        const marker = L.marker([b.lat, b.lng], { icon: createMarkerIcon(color) });
        marker.bindPopup(`
            <strong>${b.enfermedad}</strong><br>
            ${b.municipio}<br>
            Casos: <strong>${b.numero_casos}</strong><br>
            Fecha: ${b.fecha}<br>
            <small>${b.fuente}</small>
        `);
        markersLayer.addLayer(marker);
    });

    if (heatEnabled && brotes.length) {
        const points = brotes.map((b) => [b.lat, b.lng, b.numero_casos / 5]);
        heatLayer = L.heatLayer(points, {
            radius: 28,
            blur: 22,
            maxZoom: 14,
            gradient: {
                0.2: '#3498db',
                0.5: '#f39c12',
                0.8: '#e74c3c',
                1.0: '#c0392b',
            },
        }).addTo(map);
    }

    const resumen = document.getElementById('brotes-resumen');
    if (resumen) {
        const totalCasos = brotes.reduce((s, b) => s + b.numero_casos, 0);
        resumen.textContent = `${brotes.length} brotes · ${totalCasos} casos reportados`;
    }

    if (brotes.length) {
        const bounds = L.latLngBounds(brotes.map((b) => [b.lat, b.lng]));
        map.fitBounds(bounds.pad(0.15));
    }
}

async function loadBrotes() {
    const params = {};
    if (selectedMunicipio) params.municipio_id = selectedMunicipio;
    if (selectedEnfermedad) params.enfermedad_id = selectedEnfermedad;

    try {
        const brotes = await getBrotes(params);
        allBrotes = brotes;
        renderMarkers(brotes);
    } catch (e) {
        const resumen = document.getElementById('brotes-resumen');
        if (resumen) resumen.textContent = `Error: ${e.message}. ¿Está Flask en ejecución?`;
    }
}

async function loadMunicipiosSelect() {
    const select = document.getElementById('filtro-municipio');
    if (!select) return;
    try {
        const municipios = await getMunicipios();
        municipios.forEach((m) => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.nombre;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error(e);
    }
}

function setupFilters() {
    const select = document.getElementById('filtro-municipio');
    select?.addEventListener('change', () => {
        selectedMunicipio = select.value;
        loadBrotes();
    });

    document.querySelectorAll('#filtro-enfermedad .filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#filtro-enfermedad .filter-chip').forEach((c) => {
                c.classList.remove('active');
            });
            chip.classList.add('active');
            selectedEnfermedad = chip.dataset.enfermedad || '';
            loadBrotes();
        });
    });

    document.getElementById('toggle-heatmap')?.addEventListener('click', (e) => {
        heatEnabled = !heatEnabled;
        e.target.textContent = `Capa de calor: ${heatEnabled ? 'ON' : 'OFF'}`;
        renderMarkers(allBrotes);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadMunicipiosSelect();
    setupFilters();
    loadBrotes();
});
