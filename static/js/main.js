// Main application controller
class App {
    constructor() {
        this.isOnline = navigator.onLine;
        this.apiBaseUrl = '/api';
        this.currentDisease = 'dengue';
        this.refreshInterval = null;
    }

    initialize() {
        this.setupEventListeners();
        this.checkConnectivity();
        this.initializeComponents();
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        // Eventos de conectividad
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Eventos de visibilidad de página
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Botones de acción
        this.setupActionButtons();
    }

    setupActionButtons() {
        // Botón de refrescar
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refresh-btn';
        refreshBtn.className = 'action-btn';
        refreshBtn.innerHTML = '🔄 Actualizar';
        refreshBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background: #38a169;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        refreshBtn.addEventListener('click', () => this.refreshData());
        document.body.appendChild(refreshBtn);

        // Botón de exportar
        const exportBtn = document.createElement('button');
        exportBtn.id = 'export-btn';
        exportBtn.className = 'action-btn';
        exportBtn.innerHTML = '📊 Exportar';
        exportBtn.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 10px 15px;
            background: #3182ce;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        exportBtn.addEventListener('click', () => this.showExportOptions());
        document.body.appendChild(exportBtn);

        // Efectos hover
        [refreshBtn, exportBtn].forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            });
        });
    }

    initializeComponents() {
        // Inicializar componentes si existen
        if (window.mapManager) {
            console.log('Map manager initialized');
        }

        if (window.dashboardManager) {
            console.log('Dashboard manager initialized');
        }

        // Configurar actualización automática
        this.setupAutoRefresh();
    }

    setupAutoRefresh() {
        // Actualizar datos cada 5 minutos
        this.refreshInterval = setInterval(() => {
            if (this.isOnline && !document.hidden) {
                this.refreshData();
            }
        }, 300000); // 5 minutos
    }

    async refreshData() {
        try {
            this.showLoadingState();

            // Actualizar dashboard
            if (window.dashboardManager) {
                await window.dashboardManager.loadDashboardData();
            }

            // Actualizar mapa
            if (window.mapManager) {
                await window.mapManager.loadDiseaseData(window.mapManager.currentDisease);
            }

            this.showSuccessMessage('Datos actualizados correctamente');
        } catch (error) {
            console.error('Error al actualizar datos:', error);
            this.showErrorMessage('Error al actualizar datos');
        } finally {
            this.hideLoadingState();
        }
    }

    showLoadingState() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '⏳ Actualizando...';
            refreshBtn.disabled = true;
        }
    }

    hideLoadingState() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '🔄 Actualizar';
            refreshBtn.disabled = false;
        }
    }

    checkConnectivity() {
        this.updateConnectivityStatus();
        
        // Verificar conectividad periódicamente
        setInterval(() => {
            this.checkServerConnectivity();
        }, 30000); // 30 segundos
    }

    async checkServerConnectivity() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'HEAD',
                timeout: 5000
            });
            this.isOnline = response.ok;
        } catch (error) {
            this.isOnline = false;
        }
        this.updateConnectivityStatus();
    }

    updateConnectivityStatus() {
        const status = this.isOnline ? 'online' : 'offline';
        document.body.setAttribute('data-connectivity', status);

        if (!this.isOnline) {
            this.showWarningMessage('Sin conexión a internet. Algunas funciones pueden no estar disponibles.');
        }
    }

    handleOnline() {
        this.isOnline = true;
        this.updateConnectivityStatus();
        this.showSuccessMessage('Conexión restablecida');
        this.refreshData();
    }

    handleOffline() {
        this.isOnline = false;
        this.updateConnectivityStatus();
        this.showWarningMessage('Conexión perdida. Trabajando en modo offline.');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl+R o F5: Actualizar datos
        if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
            e.preventDefault();
            this.refreshData();
        }

        // Ctrl+E: Exportar datos
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this.showExportOptions();
        }

        // Esc: Cerrar modales
        if (e.key === 'Escape') {
            this.closeModals();
        }
    }

    handleVisibilityChange() {
        if (!document.hidden && this.isOnline) {
            // La página volvió a estar visible, actualizar datos
            this.refreshData();
        }
    }

    showExportOptions() {
        const modal = this.createModal('Exportar Datos', `
            <div style="text-align: center; padding: 20px;">
                <h3>Seleccione el formato de exportación</h3>
                <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                    <button id="export-json" style="padding: 10px 20px; background: #38a169; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        JSON
                    </button>
                    <button id="export-csv" style="padding: 10px 20px; background: #3182ce; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        CSV
                    </button>
                    <button id="export-cancel" style="padding: 10px 20px; background: #718096; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Cancelar
                    </button>
                </div>
            </div>
        `);

        // Event listeners
        document.getElementById('export-json').addEventListener('click', () => {
            if (window.dashboardManager) {
                window.dashboardManager.exportData('json');
            }
            this.closeModals();
        });

        document.getElementById('export-csv').addEventListener('click', () => {
            if (window.dashboardManager) {
                window.dashboardManager.exportData('csv');
            }
            this.closeModals();
        });

        document.getElementById('export-cancel').addEventListener('click', () => {
            this.closeModals();
        });
    }

    createModal(title, content) {
        // Cerrar modales existentes
        this.closeModals();

        const modal = document.createElement('div');
        modal.id = 'export-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;">
                <h2 style="margin-bottom: 20px; color: #2d3748;">${title}</h2>
                ${content}
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    closeModals() {
        const modals = document.querySelectorAll('[id$="-modal"]');
        modals.forEach(modal => modal.remove());
    }

    showWelcomeMessage() {
        setTimeout(() => {
            if (window.dashboardManager) {
                window.dashboardManager.showAlert('Bienvenido a Vigilancia Tropical - Sistema de Monitoreo de Enfermedades Tropicales', 'info');
            }
        }, 1000);
    }

    showSuccessMessage(message) {
        if (window.dashboardManager) {
            window.dashboardManager.showAlert(message, 'success');
        }
    }

    showWarningMessage(message) {
        if (window.dashboardManager) {
            window.dashboardManager.showAlert(message, 'warning');
        }
    }

    showErrorMessage(message) {
        if (window.dashboardManager) {
            window.dashboardManager.showAlert(message, 'danger');
        }
    }

    // Método para limpiar recursos
    cleanup() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.closeModals();
        
        // Remover botones de acción
        document.querySelectorAll('.action-btn').forEach(btn => btn.remove());
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.initialize();
});

// Limpiar recursos al salir de la página
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});
