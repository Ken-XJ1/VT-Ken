# Vigilancia Tropical

Sistema de monitoreo de enfermedades tropicales para Quibdó, Chocó - Colombia

##  Descripción del Proyecto

**Vigilancia Tropical** es una plataforma web integral para el monitoreo, análisis y predicción de enfermedades tropicales en el municipio de Quibdó, departamento del Chocó. El sistema proporciona herramientas de vigilancia epidemiológica en tiempo real, mapas interactivos de distribución de casos, y modelos predictivos basados en machine learning para anticipar brotes.

###  Objetivos Principales

- **Monitoreo en tiempo real** de enfermedades tropicales (Dengue, Malaria, Zika, Chikungunya)
- **Visualización geográfica** de casos y zonas de riesgo mediante mapas interactivos
- **Predicción de brotes** utilizando modelos de machine learning
- **Alertas tempranas** basadas en datos epidemiológicos y ambientales
- **Soporte a la toma de decisiones** para autoridades sanitarias locales

##  Arquitectura del Sistema

### Frontend
- **Tecnologías**: HTML5, CSS3, JavaScript (ES6+)
- **Mapas**: Leaflet.js con OpenStreetMap
- **Diseño**: Responsive, sin frameworks CSS
- **Características**: Dashboard en tiempo real, visualizaciones interactivas

### Backend
- **Framework**: FastAPI (Python)
- **API REST**: Endpoints para datos epidemiológicos, predicciones y alertas
- **CORS**: Configurado para comunicación con frontend
- **Archivos estáticos**: Servidos directamente desde el backend

### Modelo Predictivo
- **Algoritmos**: Random Forest, Linear Regression
- **Variables**: Temperatura, humedad, precipitación, casos históricos
- **Validación**: Métricas de error y confianza del modelo
- **Actualización**: Retraining periódico con nuevos datos

### Datos
- **Formato**: JSON estructurado
- **Tipos**: Epidemiológicos, ambientales, geográficos
- **Actualización**: Datos simulados con patrones realistas
- **Calidad**: Validación automática de integridad

##  Estructura del Proyecto

```
vigilancia-tropical/
├── index.html                 # Página principal del frontend
├── static/                    # Archivos estáticos
│   ├── css/
│   │   └── style.css         # Estilos CSS
│   └── js/
│       ├── main.js           # Controlador principal
│       ├── map.js            # Gestión de mapas
│       └── dashboard.js      # Dashboard y visualizaciones
├── backend/
│   └── main.py               # API FastAPI
├── model/                     # Modelos predictivos
│   ├── predictive_model.py   # Modelo de machine learning
│   └── data_processor.py     # Procesamiento de datos
├── data/                      # Datos epidemiológicos
│   ├── epidemiological_data.json
│   └── environmental_data.json
├── requirements.txt           # Dependencias Python
└── README.md                 # Este archivo
```

##  Instalación y Configuración

### Prerrequisitos

- Python 3.8 o superior
- npm (opcional, para desarrollo)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd vigilancia-tropical
   ```

2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # o
   venv\Scripts\activate     # Windows
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Entrenar modelos predictivos** (opcional)
   ```bash
   python model/predictive_model.py
   ```

5. **Iniciar el servidor backend**
   ```bash
   cd backend
   python main.py
   ```

6. **Acceder a la aplicación**
   - Abrir navegador en: `http://localhost:8000`
   - API documentation: `http://localhost:8000/docs`

##  Configuración

### Variables de Entorno

```bash
# Opcional: Configurar puerto del servidor
export PORT=8000

# Opcional: Configurar nivel de logging
export LOG_LEVEL=INFO
```

### Configuración de Base de Datos

El sistema actualmente utiliza archivos JSON para datos. Para integración con base de datos:

1. Modificar `backend/main.py` para conectar a PostgreSQL/MySQL
2. Actualizar modelos de datos según schema de base de datos
3. Configurar connection string en variables de entorno

##  Funcionalidades

### 1. Dashboard Principal
- **Estadísticas en tiempo real**: Casos activos, zonas de riesgo, alertas
- **Indicadores clave**: Tasa de atención, tendencia de casos
- **Visualizaciones**: Gráficos interactivos y métricas

### 2. Mapa Interactivo
- **Visualización geográfica**: Distribución espacial de casos
- **Filtros por enfermedad**: Dengue, Malaria, Zika, Chikungunya
- **Niveles de riesgo**: Alto, medio, bajo
- **Información detallada**: Popup con datos específicos por ubicación

### 3. Sistema de Alertas
- **Alertas automáticas**: Basadas en umbrales epidemiológicos
- **Notificaciones**: En tiempo real para autoridades
- **Recomendaciones**: Acciones sugeridas por tipo de alerta

### 4. Predicciones
- **Modelo predictivo**: Random Forest con validación cruzada
- **Pronóstico semanal**: Casos estimados para próxima semana
- **Confianza del modelo**: Porcentaje de confianza en predicciones
- **Tendencias**: Análisis de dirección de los casos

### 5. Gestión de Datos
- **Importación**: Carga de datos desde archivos JSON/CSV
- **Validación**: Verificación automática de calidad de datos
- **Exportación**: Descarga de reportes en múltiples formatos

##  API Endpoints

### Datos Epidemiológicos
- `GET /api/disease-data/{disease}` - Datos por enfermedad
- `GET /api/statistics` - Estadísticas generales
- `GET /api/historical-data/{disease}` - Datos históricos

### Predicciones
- `GET /api/predictions` - Predicciones del modelo
- `POST /api/train-model` - Entrenar nuevo modelo

### Alertas
- `GET /api/alerts` - Alertas activas
- `POST /api/alerts` - Crear nueva alerta

### Gestión de Datos
- `GET /api/load-data/{filename}` - Cargar datos desde archivo
- `POST /api/save-data/{filename}` - Guardar datos a archivo

### Sistema
- `GET /api/health` - Estado del sistema
- `GET /api/diseases` - Información de enfermedades

##  Modelos Predictivos

### Algoritmos Utilizados

1. **Random Forest Regressor**
   - Principal modelo para predicción de casos
   - Manejo de características no lineales
   - Importancia de variables interpretable

2. **Linear Regression**
   - Modelo base para comparación
   - Interpretación simple de coeficientes
   - Rápido entrenamiento

### Características del Modelo

- **Variables predictoras**:
  - Temperatura ambiental
  - Humedad relativa
  - Precipitación
  - Casos históricos (lag features)
  - Variables temporales (mes, semana del año)
  - Indicadores de temporada de lluvias

- **Métricas de evaluación**:
  - MAE (Mean Absolute Error)
  - RMSE (Root Mean Square Error)
  - R² Score
  - Intervalos de confianza

### Retraining Automático

- **Frecuencia**: Semanal
- **Trigger**: Nuevos datos disponibles
- **Validación**: Hold-out set (20%)
- **Versionamiento**: Guardar modelos con timestamp

##  Datos y Calidad

### Fuentes de Datos

1. **Datos Epidemiológicos**
   - Secretaría de Salud de Quibdó
   - SIVIGILA (Sistema Nacional de Vigilancia)
   - Reportes de centros de salud

2. **Datos Ambientales**
   - IDEAM (Instituto de Hidrología, Meteorología)
   - Estaciones meteorológicas locales
   - Satélite (precipitación, temperatura)

3. **Datos Geográficos**
   - OpenStreetMap
   - SIG del municipio
   - Censos poblacionales

### Calidad de Datos

- **Validación automática**: Rangos lógicos, consistencia temporal
- **Limpieza**: Eliminación de duplicados, manejo de valores faltantes
- **Normalización**: Estandarización de formatos y unidades
- **Métricas**: Completitud, exactitud, oportunidad, consistencia

##  Seguridad

### Medidas Implementadas

- **CORS**: Configuración restrictiva para producción
- **Validación de entrada**: Sanitización de datos de usuario
- **Rate limiting**: Límite de peticiones por IP
- **Logging**: Registro de actividades del sistema

### Recomendaciones Adicionales

- **HTTPS**: Implementar SSL/TLS en producción
- **Autenticación**: Sistema de login para usuarios autorizados
- **Base de datos**: Encriptación de datos sensibles
- **Backup**: Respaldos automáticos de datos

##  Responsive Design

El sistema está optimizado para:

- **Desktop**: 1024px y superior
- **Tablet**: 768px - 1023px
- **Mobile**: 320px - 767px

### Características Responsive

- **Layout flexible**: Grid system adaptativo
- **Navegación táctil**: Botones y controles optimizados
- **Mapa interactivo**: Zoom y gestos táctiles
- **Dashboard**: Reorganización de widgets en pantallas pequeñas

##  Actualización y Mantenimiento

### Tareas Periódicas

1. **Diarias**
   - Actualización de datos epidemiológicos
   - Verificación de calidad de datos
   - Generación de reportes automáticos

2. **Semanales**
   - Retraining de modelos predictivos
   - Evaluación de performance del sistema
   - Actualización de alertas

3. **Mensuales**
   - Análisis de tendencias epidemiológicas
   - Mantenimiento de bases de datos
   - Actualización de documentación

### Monitoreo

- **Logs del sistema**: Errores, rendimiento, uso
- **Métricas de API**: Tiempo de respuesta, tasa de errores
- **Alertas del sistema**: Caídas, problemas de conectividad
- **Uso de recursos**: CPU, memoria, almacenamiento

##  Contribución

### Guidelines para Desarrolladores

1. **Branches**: `feature/nombre-feature`, `bugfix/descripcion`
2. **Commits**: Mensajes claros y descriptivos
3. **Testing**: Unit tests para nuevas funcionalidades
4. **Documentation**: Actualizar README y comentarios

### Code Style

- **Python**: PEP 8 estándar
- **JavaScript**: ES6+ y convenciones modernas
- **CSS**: BEM methodology para nombres de clases
- **HTML**: Semántico y accesible

##  Licencia

Este proyecto está bajo licencia MIT License - ver archivo LICENSE para detalles.

## Contacto

- **Desarrollador Principal**: [Nombre del desarrollador]
- **Email**: [email de contacto]
- **Institución**: [Nombre de la institución]
- **Teléfono**: [+57 XXX XXX XXXX]

##  Agradecimientos

- Secretaría de Salud de Quibdó
- Instituto de Hidrología, Meteorología y Estudios Ambientales (IDEAM)
- Ministerio de Salud y Protección Social de Colombia
- Comunidad de desarrolladores de software libre

---

**Nota**: Este es un sistema de demostración con datos simulados. Para uso en producción, se requiere integración con sistemas reales de vigilancia epidemiológica y validación por autoridades sanitarias.
