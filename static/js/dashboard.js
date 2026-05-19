// Dashboard functionality and data management
class DashboardManager {
    constructor() {
        this.stats = {
            activeCases: 0,
            riskZones: 0,
            activeAlerts: 0,
            attentionRate: 0
        };
        this.predictions = {
            weekPrediction: 0,
            trend: 'stable',
            confidence: 0
        };
    }

    initializeDashboard() {
        this.loadDashboardData();
        this.setupAutoRefresh();
    }

    async loadDashboardData() {
        try {
            // Cargar estadísticas principales
            await this.loadStatistics();
            
            // Cargar predicciones
            await this.loadPredictions();
            
            // Actualizar UI
            this.updateDashboardUI();
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
            // Usar datos de ejemplo
            this.loadMockData();
        }
    }

    async loadStatistics() {
        try {
            const response = await fetch('/api/statistics');
            const data = await response.json();
            
            this.stats = {
                activeCases: data.activeCases || 0,
                riskZones: data.riskZones || 0,
                activeAlerts: data.activeAlerts || 0,
                attentionRate: data.attentionRate || 0
            };
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            throw error;
        }
    }

    async loadPredictions() {
        try {
            const response = await fetch('/api/predictions');
            const data = await response.json();
            
            this.predictions = {
                weekPrediction: data.weekPrediction || 0,
                trend: data.trend || 'stable',
                confidence: data.confidence || 0
            };
        } catch (error) {
            console.error('Error al cargar predicciones:', error);
            throw error;
        }
    }

    loadMockData() {
        // Datos de ejemplo para demostración
        this.stats = {
            activeCases: 47,
            riskZones: 12,
            activeAlerts: 3,
            attentionRate: 78
        };

        this.predictions = {
            weekPrediction: 62,
            trend: 'up',
            confidence: 85
        };

        this.updateDashboardUI();
    }

    updateDashboardUI() {
        // Actualizar estadísticas principales
        this.updateStatCard('active-cases', this.stats.activeCases);
        this.updateStatCard('risk-zones', this.stats.riskZones);
        this.updateStatCard('active-alerts', this.stats.activeAlerts);
        this.updateStatCard('attention-rate', `${this.stats.attentionRate}%`);

        // Actualizar predicciones
        this.updatePredictions();
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            // Animación de contador
            this.animateCounter(element, parseInt(value) || 0);
        }
    }

    animateCounter(element, targetValue) {
        const duration = 1000; // 1 segundo
        const startValue = parseInt(element.textContent) || 0;
        const increment = (targetValue - startValue) / (duration / 16); // 60fps
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            
            if ((increment > 0 && currentValue >= targetValue) || 
                (increment < 0 && currentValue <= targetValue)) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.round(currentValue);
            }
        }, 16);
    }

    updatePredictions() {
        // Actualizar predicción semanal
        const weekElement = document.getElementById('week-prediction');
        if (weekElement) {
            this.animateCounter(weekElement, this.predictions.weekPrediction);
        }

        // Actualizar tendencia
        this.updateTrendIndicator();

        // Actualizar confianza del modelo
        this.updateConfidenceBar();
    }

    updateTrendIndicator() {
        const trendArrow = document.getElementById('trend-arrow');
        const trendText = document.getElementById('trend-text');
        const trendIndicator = document.getElementById('trend-indicator');

        if (!trendArrow || !trendText || !trendIndicator) return;

        // Remover clases existentes
        trendIndicator.classList.remove('trend-up', 'trend-down', 'trend-stable');

        switch (this.predictions.trend) {
            case 'up':
                trendArrow.textContent = '↑';
                trendText.textContent = 'Aumento';
                trendIndicator.classList.add('trend-up');
                break;
            case 'down':
                trendArrow.textContent = '↓';
                trendText.textContent = 'Disminución';
                trendIndicator.classList.add('trend-down');
                break;
            default:
                trendArrow.textContent = '→';
                trendText.textContent = 'Estable';
                trendIndicator.classList.add('trend-stable');
        }
    }

    updateConfidenceBar() {
        const confidenceFill = document.getElementById('confidence-fill');
        const confidenceText = document.getElementById('confidence-text');

        if (confidenceFill) {
            confidenceFill.style.width = `${this.predictions.confidence}%`;
        }

        if (confidenceText) {
            confidenceText.textContent = `${this.predictions.confidence}%`;
        }
    }

    setupAutoRefresh() {
        // Actualizar datos cada 5 minutos
        setInterval(() => {
            this.loadDashboardData();
        }, 300000); // 5 minutos en milisegundos

        // Actualizar cada minuto si hay alertas activas
        setInterval(() => {
            if (this.stats.activeAlerts > 0) {
                this.loadStatistics();
                this.updateDashboardUI();
            }
        }, 60000); // 1 minuto
    }

    // Método para mostrar notificaciones
    showAlert(message, type = 'info') {
        // Crear elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        // Insertar al principio del main
        const main = document.querySelector('main');
        const container = main.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);

        // Remover después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Método para manejar errores
    handleError(error, context = '') {
        console.error(`Error en ${context}:`, error);
        this.showAlert('Error al cargar datos. Por favor, intente nuevamente.', 'danger');
    }

    // Método para exportar datos
    exportData(format = 'json') {
        const data = {
            stats: this.stats,
            predictions: this.predictions,
            timestamp: new Date().toISOString()
        };

        switch (format) {
            case 'json':
                this.downloadJSON(data, 'dashboard-data.json');
                break;
            case 'csv':
                this.downloadCSV(data, 'dashboard-data.csv');
                break;
            default:
                console.error('Formato no soportado:', format);
        }
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    downloadCSV(data, filename) {
        let csv = 'Metric,Value,Timestamp\n';
        
        // Agregar estadísticas
        Object.entries(data.stats).forEach(([key, value]) => {
            csv += `${key},${value},${data.timestamp}\n`;
        });

        // Agregar predicciones
        Object.entries(data.predictions).forEach(([key, value]) => {
            csv += `prediction_${key},${value},${data.timestamp}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadBlob(blob, filename);
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Método para manejar temas (modo oscuro/claro)
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
    window.dashboardManager.initializeDashboard();
    window.dashboardManager.loadTheme();
});
