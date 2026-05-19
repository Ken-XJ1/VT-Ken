#!/usr/bin/env python3
"""
Servidor HTTP simple para Vigilancia Tropical
Servidor de desarrollo sin dependencias externas
"""

import http.server
import socketserver
import json
import os
from datetime import datetime, timedelta
import random
from urllib.parse import urlparse, parse_qs
import mimetypes

class VigilanciaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # API endpoints
        if path.startswith('/api/'):
            self.handle_api_request(path)
            return
        
        # Servir archivos estáticos
        if path == '/':
            path = '/index.html'
        
        file_path = path.lstrip('/')
        
        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.serve_file(file_path)
        else:
            self.send_error(404, "File not found")
    
    def handle_api_request(self, path):
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
        
        response_data = {}
        
        if path == '/api/health':
            response_data = {"status": "healthy", "timestamp": datetime.now().isoformat()}
        
        elif path.startswith('/api/disease-data/'):
            disease = path.split('/')[-1]
            if disease in DISEASE_DATA:
                # Simular variación en los datos
                data = DISEASE_DATA[disease]
                varied_data = []
                for point in data:
                    varied_point = point.copy()
                    variation = random.uniform(0.8, 1.2)
                    varied_point["cases"] = max(1, int(point["cases"] * variation))
                    varied_data.append(varied_point)
                response_data = varied_data
            else:
                self.send_error(404, f"Enfermedad '{disease}' no encontrada")
                return
        
        elif path == '/api/statistics':
            total_cases = sum(sum(point["cases"] for point in data) for data in DISEASE_DATA.values())
            risk_zones = sum(
                sum(1 for point in data if point["risk"] in ["high", "medium"])
                for data in DISEASE_DATA.values()
            )
            active_alerts = random.randint(1, 5)
            attention_rate = random.randint(70, 95)
            
            response_data = {
                "activeCases": total_cases,
                "riskZones": risk_zones,
                "activeAlerts": active_alerts,
                "attentionRate": attention_rate,
                "lastUpdated": datetime.now().isoformat()
            }
        
        elif path == '/api/predictions':
            week_prediction = random.randint(40, 80)
            trend_options = ["up", "down", "stable"]
            trend_weights = [0.3, 0.2, 0.5]
            trend = random.choices(trend_options, weights=trend_weights)[0]
            confidence = random.randint(75, 95)
            
            response_data = {
                "weekPrediction": week_prediction,
                "trend": trend,
                "confidence": confidence,
                "modelVersion": "1.0.0",
                "lastTrained": (datetime.now() - timedelta(days=7)).isoformat(),
                "predictionDate": datetime.now().isoformat()
            }
        
        elif path == '/api/diseases':
            response_data = {
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
        
        elif path == '/api/alerts':
            response_data = [
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
        
        else:
            self.send_error(404, "API endpoint not found")
            return
        
        # Enviar respuesta JSON
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
    
    def serve_file(self, file_path):
        # Determinar el tipo MIME
        mime_type, _ = mimetypes.guess_type(file_path)
        if mime_type is None:
            mime_type = 'application/octet-stream'
        
        # Leer el archivo
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            
            self.send_response(200)
            self.send_header('Content-type', mime_type)
            self.send_header('Content-length', str(len(content)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error serving file: {e}")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    """Iniciar el servidor HTTP"""
    
    handler = VigilanciaHandler
    
    print(f"🚀 Iniciando servidor de Vigilancia Tropical...")
    print(f"📊 Dashboard disponible en: http://localhost:{port}")
    print(f"🌍 Mapa interactivo funcionando")
    print(f"📈 API endpoints disponibles:")
    print(f"   - GET /api/health")
    print(f"   - GET /api/disease-data/{{disease}}")
    print(f"   - GET /api/statistics")
    print(f"   - GET /api/predictions")
    print(f"   - GET /api/diseases")
    print(f"   - GET /api/alerts")
    print(f"\n🔄 Presiona Ctrl+C para detener el servidor")
    
    try:
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"✅ Servidor corriendo en el puerto {port}")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print(f"\n🛑 Servidor detenido")
    except Exception as e:
        print(f"❌ Error al iniciar servidor: {e}")

if __name__ == "__main__":
    run_server()
