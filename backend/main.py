from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import random

app = FastAPI(
    title="Vigilancia Tropical API",
    description="API para el sistema de monitoreo de enfermedades tropicales en Quibdó, Chocó",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Ruta principal para servir el HTML
@app.get("/")
async def read_index():
    return FileResponse("index.html")

# Datos de ejemplo para enfermedades tropicales
DISEASE_DATA = {
    "dengue": [
        {"lat": 5.6945, "lng": -76.6585, "cases": 15, "risk": "high", "location": "Centro"},
        {"lat": 5.7000, "lng": -76.6500, "cases": 8, "risk": "medium", "location": "El Pato"},
        {"lat": 5.6800, "lng": -76.6600, "cases": 3, "risk": "low", "location": "La Esperanza"},
        {"lat": 5.7100, "lng": -76.6700, "cases": 12, "risk": "high", "location": "San Francisco"},
        {"lat": 5.6900, "lng": -76.6400, "cases": 5, "risk": "medium", "location": "Barrio Obrero"}
    ],
    "malaria": [
        {"lat": 5.6945, "lng": -76.6585, "cases": 8, "risk": "medium", "location": "Centro"},
        {"lat": 5.7000, "lng": -76.6500, "cases": 20, "risk": "high", "location": "El Pato"},
        {"lat": 5.6800, "lng": -76.6600, "cases": 2, "risk": "low", "location": "La Esperanza"},
        {"lat": 5.7100, "lng": -76.6700, "cases": 15, "risk": "high", "location": "San Francisco"},
        {"lat": 5.6900, "lng": -76.6400, "cases": 4, "risk": "medium", "location": "Barrio Obrero"}
    ],
    "zika": [
        {"lat": 5.6945, "lng": -76.6585, "cases": 3, "risk": "low", "location": "Centro"},
        {"lat": 5.7000, "lng": -76.6500, "cases": 6, "risk": "medium", "location": "El Pato"},
        {"lat": 5.6800, "lng": -76.6600, "cases": 1, "risk": "low", "location": "La Esperanza"},
        {"lat": 5.7100, "lng": -76.6700, "cases": 4, "risk": "medium", "location": "San Francisco"},
        {"lat": 5.6900, "lng": -76.6400, "cases": 2, "risk": "low", "location": "Barrio Obrero"}
    ],
    "chikungunya": [
        {"lat": 5.6945, "lng": -76.6585, "cases": 5, "risk": "medium", "location": "Centro"},
        {"lat": 5.7000, "lng": -76.6500, "cases": 10, "risk": "high", "location": "El Pato"},
        {"lat": 5.6800, "lng": -76.6600, "cases": 2, "risk": "low", "location": "La Esperanza"},
        {"lat": 5.7100, "lng": -76.6700, "cases": 7, "risk": "medium", "location": "San Francisco"},
        {"lat": 5.6900, "lng": -76.6400, "cases": 3, "risk": "low", "location": "Barrio Obrero"}
    ]
}

# Endpoint de salud
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Endpoint para obtener datos de enfermedades
@app.get("/api/disease-data/{disease}")
async def get_disease_data(disease: str):
    if disease not in DISEASE_DATA:
        raise HTTPException(status_code=404, detail=f"Enfermedad '{disease}' no encontrada")
    
    # Simular variación en los datos
    data = DISEASE_DATA[disease]
    varied_data = []
    
    for point in data:
        varied_point = point.copy()
        # Variar casos ±20%
        variation = random.uniform(0.8, 1.2)
        varied_point["cases"] = max(1, int(point["cases"] * variation))
        varied_data.append(varied_point)
    
    return varied_data

# Endpoint para estadísticas generales
@app.get("/api/statistics")
async def get_statistics():
    # Calcular estadísticas basadas en los datos actuales
    total_cases = sum(sum(point["cases"] for point in data) for data in DISEASE_DATA.values())
    
    # Calcular zonas de riesgo (riesgo alto o medio)
    risk_zones = sum(
        sum(1 for point in data if point["risk"] in ["high", "medium"])
        for data in DISEASE_DATA.values()
    )
    
    # Simular alertas activas
    active_alerts = random.randint(1, 5)
    
    # Simular tasa de atención
    attention_rate = random.randint(70, 95)
    
    return {
        "activeCases": total_cases,
        "riskZones": risk_zones,
        "activeAlerts": active_alerts,
        "attentionRate": attention_rate,
        "lastUpdated": datetime.now().isoformat()
    }

# Endpoint para predicciones
@app.get("/api/predictions")
async def get_predictions():
    # Simular predicciones del modelo
    week_prediction = random.randint(40, 80)
    
    # Determinar tendencia
    trend_options = ["up", "down", "stable"]
    trend_weights = [0.3, 0.2, 0.5]  # Más probable que sea estable
    trend = random.choices(trend_options, weights=trend_weights)[0]
    
    # Simular confianza del modelo
    confidence = random.randint(75, 95)
    
    return {
        "weekPrediction": week_prediction,
        "trend": trend,
        "confidence": confidence,
        "modelVersion": "1.0.0",
        "lastTrained": (datetime.now() - timedelta(days=7)).isoformat(),
        "predictionDate": datetime.now().isoformat()
    }

# Endpoint para obtener historial de datos
@app.get("/api/historical-data/{disease}")
async def get_historical_data(disease: str, days: int = 30):
    if disease not in DISEASE_DATA:
        raise HTTPException(status_code=404, detail=f"Enfermedad '{disease}' no encontrada")
    
    # Generar datos históricos simulados
    historical_data = []
    base_cases = sum(point["cases"] for point in DISEASE_DATA[disease])
    
    for i in range(days):
        date = datetime.now() - timedelta(days=i)
        # Simular variación estacional y aleatoria
        seasonal_factor = 1 + 0.3 * (0.5 - abs((date.timetuple().tm_yday % 365) / 365 - 0.5))
        random_factor = random.uniform(0.7, 1.3)
        daily_cases = max(1, int(base_cases * seasonal_factor * random_factor))
        
        historical_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "cases": daily_cases,
            "disease": disease
        })
    
    return historical_data[::-1]  # Ordenar por fecha ascendente

# Endpoint para obtener información de enfermedades
@app.get("/api/diseases")
async def get_diseases():
    diseases_info = {
        "dengue": {
            "name": "Dengue",
            "description": "Enfermedad viral transmitida por mosquitos Aedes",
            "symptoms": ["Fiebre alta", "Dolor de cabeza", "Dolor muscular y articular", "Erupción cutánea"],
            "prevention": ["Uso de repelente", "Eliminación de criaderos", "Mosquiteros"],
            "incubation_days": 4
        },
        "malaria": {
            "name": "Malaria",
            "description": "Enfermedad parasitaria transmitida por mosquitos Anopheles",
            "symptoms": ["Fiebre escalofríos", "Sudoración", "Dolor de cabeza", "Náuseas"],
            "prevention": ["Mosiaceros", "Medicamentos preventivos", "Repelentes"],
            "incubation_days": 10
        },
        "zika": {
            "name": "Zika",
            "description": "Enfermedad viral transmitida por mosquitos Aedes",
            "symptoms": ["Fiebre leve", "Conjuntivitis", "Dolor muscular", "Erupción cutánea"],
            "prevention": ["Control de mosquitos", "Protección personal", "Evitar viajes a zonas endémicas"],
            "incubation_days": 3
        },
        "chikungunya": {
            "name": "Chikungunya",
            "description": "Enfermedad viral transmitida por mosquitos Aedes",
            "symptoms": ["Fiebre alta", "Dolor articular severo", "Dolor de cabeza", "Fatiga"],
            "prevention": ["Control vectorial", "Repelentes", "Ropa protectora"],
            "incubation_days": 4
        }
    }
    
    return diseases_info

# Endpoint para alertas
@app.get("/api/alerts")
async def get_alerts():
    alerts = [
        {
            "id": 1,
            "type": "warning",
            "disease": "dengue",
            "location": "El Pato",
            "message": "Aumento significativo de casos de dengue en la última semana",
            "severity": "medium",
            "timestamp": datetime.now().isoformat(),
            "actions": ["Intensificar fumigación", "Campaña de concientización", "Monitoreo clínico"]
        },
        {
            "id": 2,
            "type": "info",
            "disease": "malaria",
            "location": "Zona rural",
            "message": "Condiciones climáticas favorables para proliferación de mosquitos",
            "severity": "low",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "actions": ["Vigilancia entomológica", "Educación comunitaria"]
        }
    ]
    
    return alerts

# Endpoint para cargar datos desde archivos JSON si existen
@app.get("/api/load-data/{filename}")
async def load_data_from_file(filename: str):
    file_path = f"data/{filename}"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Archivo '{filename}' no encontrado")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {"data": data, "loaded_at": datetime.now().isoformat()}
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Error al decodificar el archivo JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al leer el archivo: {str(e)}")

# Endpoint para guardar datos
@app.post("/api/save-data/{filename}")
async def save_data_to_file(filename: str, data: Dict):
    file_path = f"data/{filename}"
    
    # Crear directorio si no existe
    os.makedirs("data", exist_ok=True)
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return {"message": "Datos guardados exitosamente", "file": filename, "saved_at": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
