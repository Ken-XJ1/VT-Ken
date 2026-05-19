// Map configuration and initialization
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentDisease = 'dengue';
        this.heatmapLayer = null;
        this.quibdoCenter = [5.6945, -76.6585]; // Coordenadas de Quibdó, Chocó
    }

    initializeMap() {
        // Inicializar el mapa centrado en Quibdó
        this.map = L.map('map').setView(this.quibdoCenter, 13);

        // Añadir capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Cargar datos iniciales
        this.loadDiseaseData(this.currentDisease);

        // Configurar eventos
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Botones de enfermedades
        document.getElementById('btn-dengue').addEventListener('click', () => {
            this.switchDisease('dengue');
        });

        document.getElementById('btn-malaria').addEventListener('click', () => {
            this.switchDisease('malaria');
        });

        document.getElementById('btn-zika').addEventListener('click', () => {
            this.switchDisease('zika');
        });

        document.getElementById('btn-chikungunya').addEventListener('click', () => {
            this.switchDisease('chikungunya');
        });
    }

    switchDisease(disease) {
        this.currentDisease = disease;
        
        // Actualizar botones activos
        document.querySelectorAll('.disease-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`btn-${disease}`).classList.add('active');

        // Limpiar marcadores existentes
        this.clearMarkers();

        // Cargar nuevos datos
        this.loadDiseaseData(disease);
    }

    async loadDiseaseData(disease) {
        try {
            // Simular carga de datos desde el backend
            const response = await fetch(`/api/disease-data/${disease}`);
            const data = await response.json();

            // Procesar y mostrar datos en el mapa
            this.displayDiseaseData(data);
        } catch (error) {
            console.error('Error al cargar datos de enfermedad:', error);
            // Usar datos de ejemplo si falla la API
            this.loadMockData(disease);
        }
    }

    loadMockData(disease) {
        // Datos de ejemplo para diferentes barrios de Quibdó
        const mockData = {
            dengue: [
                { lat: 5.6945, lng: -76.6585, cases: 15, risk: 'high', location: 'Centro' },
                { lat: 5.7000, lng: -76.6500, cases: 8, risk: 'medium', location: 'El Pato' },
                { lat: 5.6800, lng: -76.6600, cases: 3, risk: 'low', location: 'La Esperanza' },
                { lat: 5.7100, lng: -76.6700, cases: 12, risk: 'high', location: 'San Francisco' },
                { lat: 5.6900, lng: -76.6400, cases: 5, risk: 'medium', location: 'Barrio Obrero' }
            ],
            malaria: [
                { lat: 5.6945, lng: -76.6585, cases: 8, risk: 'medium', location: 'Centro' },
                { lat: 5.7000, lng: -76.6500, cases: 20, risk: 'high', location: 'El Pato' },
                { lat: 5.6800, lng: -76.6600, cases: 2, risk: 'low', location: 'La Esperanza' },
                { lat: 5.7100, lng: -76.6700, cases: 15, risk: 'high', location: 'San Francisco' },
                { lat: 5.6900, lng: -76.6400, cases: 4, risk: 'medium', location: 'Barrio Obrero' }
            ],
            zika: [
                { lat: 5.6945, lng: -76.6585, cases: 3, risk: 'low', location: 'Centro' },
                { lat: 5.7000, lng: -76.6500, cases: 6, risk: 'medium', location: 'El Pato' },
                { lat: 5.6800, lng: -76.6600, cases: 1, risk: 'low', location: 'La Esperanza' },
                { lat: 5.7100, lng: -76.6700, cases: 4, risk: 'medium', location: 'San Francisco' },
                { lat: 5.6900, lng: -76.6400, cases: 2, risk: 'low', location: 'Barrio Obrero' }
            ],
            chikungunya: [
                { lat: 5.6945, lng: -76.6585, cases: 5, risk: 'medium', location: 'Centro' },
                { lat: 5.7000, lng: -76.6500, cases: 10, risk: 'high', location: 'El Pato' },
                { lat: 5.6800, lng: -76.6600, cases: 2, risk: 'low', location: 'La Esperanza' },
                { lat: 5.7100, lng: -76.6700, cases: 7, risk: 'medium', location: 'San Francisco' },
                { lat: 5.6900, lng: -76.6400, cases: 3, risk: 'low', location: 'Barrio Obrero' }
            ]
        };

        this.displayDiseaseData(mockData[disease] || []);
    }

    displayDiseaseData(data) {
        data.forEach(point => {
            const color = this.getRiskColor(point.risk);
            const marker = L.circleMarker([point.lat, point.lng], {
                radius: this.getMarkerSize(point.cases),
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.7
            }).addTo(this.map);

            // Popup con información
            marker.bindPopup(`
                <div style="text-align: center;">
                    <h4>${point.location}</h4>
                    <p><strong>Casos:</strong> ${point.cases}</p>
                    <p><strong>Riesgo:</strong> ${this.getRiskLabel(point.risk)}</p>
                    <p><strong>Enfermedad:</strong> ${this.getDiseaseLabel(this.currentDisease)}</p>
                </div>
            `);

            this.markers.push(marker);
        });
    }

    getRiskColor(risk) {
        const colors = {
            high: '#e53e3e',
            medium: '#ed8936',
            low: '#48bb78'
        };
        return colors[risk] || '#718096';
    }

    getRiskLabel(risk) {
        const labels = {
            high: 'Alto',
            medium: 'Medio',
            low: 'Bajo'
        };
        return labels[risk] || 'Desconocido';
    }

    getDiseaseLabel(disease) {
        const labels = {
            dengue: 'Dengue',
            malaria: 'Malaria',
            zika: 'Zika',
            chikungunya: 'Chikungunya'
        };
        return labels[disease] || disease;
    }

    getMarkerSize(cases) {
        // Tamaño del marcador basado en el número de casos
        if (cases <= 5) return 8;
        if (cases <= 10) return 12;
        if (cases <= 15) return 16;
        return 20;
    }

    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Método para actualizar datos en tiempo real
    updateRealTimeData() {
        // Simular actualización cada 30 segundos
        setInterval(() => {
            this.loadDiseaseData(this.currentDisease);
        }, 30000);
    }

    // Método para agregar capa de calor (requiere plugin adicional)
    addHeatmap(data) {
        // Este método requeriría el plugin leaflet.heat
        // Por ahora, usamos círculos como alternativa
        console.log('Heatmap data:', data);
    }

    // Método para exportar mapa como imagen
    exportMap() {
        // Implementar exportación del mapa
        console.log('Exportar mapa');
    }
}

// Inicializar el mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.mapManager = new MapManager();
    window.mapManager.initializeMap();
    window.mapManager.updateRealTimeData();
});
