"""
Modelo Predictivo para Vigilancia de Enfermedades Tropicales
Este módulo implementa modelos de machine learning para predecir brotes de enfermedades tropicales
en Quibdó, Chocó, basándose en datos históricos y variables ambientales.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import json
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

class TropicalDiseasePredictor:
    """
    Clase principal para la predicción de enfermedades tropicales
    """
    
    def __init__(self):
        self.models = {
            'dengue': None,
            'malaria': None,
            'zika': None,
            'chikungunya': None
        }
        self.scalers = {
            'dengue': None,
            'malaria': None,
            'zika': None,
            'chikungunya': None
        }
        self.feature_columns = [
            'temperature', 'humidity', 'rainfall', 'cases_lag_1', 
            'cases_lag_7', 'month', 'week_of_year', 'is_rainy_season'
        ]
        self.is_trained = False
        
    def prepare_features(self, data: Dict) -> pd.DataFrame:
        """
        Prepara las características para el modelo predictivo
        
        Args:
            data: Diccionario con datos históricos y ambientales
            
        Returns:
            DataFrame con características preparadas
        """
        features = []
        
        for record in data.get('historical_data', []):
            # Datos básicos
            feature = {
                'temperature': record.get('temperature', 28.0),
                'humidity': record.get('humidity', 85.0),
                'rainfall': record.get('rainfall', 150.0),
                'cases_lag_1': record.get('cases_lag_1', 0),
                'cases_lag_7': record.get('cases_lag_7', 0),
                'month': record.get('month', datetime.now().month),
                'week_of_year': record.get('week_of_year', datetime.now().isocalendar()[1]),
                'is_rainy_season': 1 if record.get('month', 0) in [4, 5, 10, 11] else 0
            }
            features.append(feature)
        
        return pd.DataFrame(features)
    
    def train_model(self, disease: str, training_data: Dict) -> Dict:
        """
        Entrena el modelo predictivo para una enfermedad específica
        
        Args:
            disease: Nombre de la enfermedad
            training_data: Datos de entrenamiento
            
        Returns:
            Diccionario con métricas del entrenamiento
        """
        if disease not in self.models:
            raise ValueError(f"Enfermedad '{disease}' no soportada")
        
        # Preparar datos
        X = self.prepare_features(training_data)
        y = np.array([record['cases'] for record in training_data.get('historical_data', [])])
        
        if len(X) < 10:
            raise ValueError("Insuficientes datos para entrenamiento (mínimo 10 registros)")
        
        # Dividir datos
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Escalar características
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Entrenar modelo
        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42,
            max_depth=10,
            min_samples_split=5
        )
        
        model.fit(X_train_scaled, y_train)
        
        # Evaluar modelo
        y_pred = model.predict(X_test_scaled)
        
        metrics = {
            'mae': mean_absolute_error(y_test, y_pred),
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred),
            'training_samples': len(X_train),
            'test_samples': len(X_test)
        }
        
        # Guardar modelo y scaler
        self.models[disease] = model
        self.scalers[disease] = scaler
        self.is_trained = True
        
        return metrics
    
    def predict(self, disease: str, future_data: Dict, days_ahead: int = 7) -> Dict:
        """
        Realiza predicciones para los próximos días
        
        Args:
            disease: Nombre de la enfermedad
            future_data: Datos futuros estimados
            days_ahead: Número de días a predecir
            
        Returns:
            Diccionario con predicciones y confianza
        """
        if disease not in self.models or self.models[disease] is None:
            raise ValueError(f"Modelo para '{disease}' no entrenado")
        
        model = self.models[disease]
        scaler = self.scalers[disease]
        
        predictions = []
        confidence_scores = []
        
        # Generar predicciones para cada día
        for day in range(days_ahead):
            # Preparar características para el día específico
            feature_dict = {
                'temperature': future_data.get('temperature', 28.0),
                'humidity': future_data.get('humidity', 85.0),
                'rainfall': future_data.get('rainfall', 150.0),
                'cases_lag_1': predictions[-1] if predictions else future_data.get('current_cases', 10),
                'cases_lag_7': future_data.get('cases_lag_7', 50),
                'month': (datetime.now() + timedelta(days=day)).month,
                'week_of_year': (datetime.now() + timedelta(days=day)).isocalendar()[1],
                'is_rainy_season': 1 if (datetime.now() + timedelta(days=day)).month in [4, 5, 10, 11] else 0
            }
            
            # Convertir a DataFrame
            feature_df = pd.DataFrame([feature_dict])
            
            # Escalar características
            feature_scaled = scaler.transform(feature_df)
            
            # Realizar predicción
            prediction = max(0, model.predict(feature_scaled)[0])
            predictions.append(int(prediction))
            
            # Calcular confianza (basada en la varianza de los árboles)
            tree_predictions = [tree.predict(feature_scaled)[0] for tree in model.estimators_]
            confidence = 1 - (np.std(tree_predictions) / np.mean(tree_predictions) if np.mean(tree_predictions) > 0 else 0)
            confidence_scores.append(min(0.95, max(0.5, confidence)))
        
        # Calcular tendencia
        if len(predictions) >= 2:
            trend = 'up' if predictions[-1] > predictions[0] else 'down' if predictions[-1] < predictions[0] else 'stable'
        else:
            trend = 'stable'
        
        return {
            'disease': disease,
            'predictions': predictions,
            'confidence_scores': confidence_scores,
            'average_confidence': np.mean(confidence_scores),
            'trend': trend,
            'days_predicted': days_ahead,
            'prediction_date': datetime.now().isoformat()
        }
    
    def save_model(self, disease: str, filepath: str) -> bool:
        """
        Guarda el modelo entrenado en archivo
        
        Args:
            disease: Nombre de la enfermedad
            filepath: Ruta del archivo
            
        Returns:
            True si se guardó exitosamente
        """
        if disease not in self.models or self.models[disease] is None:
            return False
        
        try:
            model_data = {
                'model': self.models[disease],
                'scaler': self.scalers[disease],
                'feature_columns': self.feature_columns,
                'trained_date': datetime.now().isoformat()
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            return True
        except Exception as e:
            print(f"Error al guardar modelo: {e}")
            return False
    
    def load_model(self, disease: str, filepath: str) -> bool:
        """
        Carga un modelo entrenado desde archivo
        
        Args:
            disease: Nombre de la enfermedad
            filepath: Ruta del archivo
            
        Returns:
            True si se cargó exitosamente
        """
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.models[disease] = model_data['model']
            self.scalers[disease] = model_data['scaler']
            self.feature_columns = model_data['feature_columns']
            self.is_trained = True
            
            return True
        except Exception as e:
            print(f"Error al cargar modelo: {e}")
            return False
    
    def get_feature_importance(self, disease: str) -> Dict:
        """
        Obtiene la importancia de las características para un modelo
        
        Args:
            disease: Nombre de la enfermedad
            
        Returns:
            Diccionario con importancia de características
        """
        if disease not in self.models or self.models[disease] is None:
            return {}
        
        model = self.models[disease]
        importance = model.feature_importances_
        
        feature_importance = {
            feature: float(importance[i]) 
            for i, feature in enumerate(self.feature_columns)
        }
        
        # Ordenar por importancia
        sorted_importance = dict(
            sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        )
        
        return sorted_importance
    
    def generate_training_data(self, days: int = 365) -> Dict:
        """
        Genera datos de entrenamiento simulados para demostración
        
        Args:
            days: Número de días de datos a generar
            
        Returns:
            Diccionario con datos simulados
        """
        historical_data = []
        base_cases = 20
        
        for i in range(days):
            date = datetime.now() - timedelta(days=i)
            
            # Simular variación estacional
            seasonal_factor = 1 + 0.4 * np.sin(2 * np.pi * date.timetuple().tm_yday / 365)
            
            # Simular datos ambientales
            temperature = 25 + 5 * np.sin(2 * np.pi * date.timetuple().tm_yday / 365) + np.random.normal(0, 2)
            humidity = 80 + 10 * np.sin(2 * np.pi * date.timetuple().tm_yday / 365) + np.random.normal(0, 5)
            rainfall = 150 + 100 * np.sin(2 * np.pi * date.timetuple().tm_yday / 365) + np.random.normal(0, 30)
            
            # Calcular casos basados en factores ambientales y estacionales
            cases = max(1, int(
                base_cases * seasonal_factor * 
                (1 + (temperature - 25) / 10) * 
                (1 + (humidity - 80) / 50) * 
                (1 + rainfall / 300) +
                np.random.normal(0, 5)
            ))
            
            record = {
                'date': date.strftime('%Y-%m-%d'),
                'cases': cases,
                'temperature': max(15, min(40, temperature)),
                'humidity': max(40, min(100, humidity)),
                'rainfall': max(0, rainfall),
                'cases_lag_1': historical_data[-1]['cases'] if historical_data else cases,
                'cases_lag_7': historical_data[-7]['cases'] if len(historical_data) >= 7 else cases,
                'month': date.month,
                'week_of_year': date.isocalendar()[1]
            }
            
            historical_data.append(record)
        
        return {
            'historical_data': historical_data[::-1],  # Orden cronológico
            'generated_date': datetime.now().isoformat(),
            'total_days': days
        }

# Función de utilidad para crear y entrenar modelos
def create_and_train_models():
    """
    Función de utilidad para crear y entrenar todos los modelos
    """
    predictor = TropicalDiseasePredictor()
    
    # Enfermedades a modelar
    diseases = ['dengue', 'malaria', 'zika', 'chikungunya']
    training_results = {}
    
    for disease in diseases:
        try:
            # Generar datos de entrenamiento
            training_data = predictor.generate_training_data(days=365)
            
            # Entrenar modelo
            metrics = predictor.train_model(disease, training_data)
            
            # Guardar modelo
            model_path = f"model/{disease}_model.pkl"
            predictor.save_model(disease, model_path)
            
            training_results[disease] = {
                'status': 'success',
                'metrics': metrics,
                'model_path': model_path
            }
            
            print(f"✅ Modelo '{disease}' entrenado exitosamente")
            print(f"   R² Score: {metrics['r2']:.3f}")
            print(f"   MAE: {metrics['mae']:.2f}")
            
        except Exception as e:
            training_results[disease] = {
                'status': 'error',
                'error': str(e)
            }
            print(f"❌ Error entrenando modelo '{disease}': {e}")
    
    return predictor, training_results

# Ejemplo de uso
if __name__ == "__main__":
    # Crear y entrenar modelos
    predictor, results = create_and_train_models()
    
    # Realizar predicciones de ejemplo
    if predictor.is_trained:
        for disease in ['dengue', 'malaria']:
            try:
                future_data = {
                    'temperature': 28.5,
                    'humidity': 85.0,
                    'rainfall': 180.0,
                    'current_cases': 25,
                    'cases_lag_7': 150
                }
                
                prediction = predictor.predict(disease, future_data, days_ahead=7)
                print(f"\n📊 Predicción para {disease}:")
                print(f"   Próxima semana: {prediction['predictions'][-1]} casos")
                print(f"   Tendencia: {prediction['trend']}")
                print(f"   Confianza: {prediction['average_confidence']:.2f}")
                
            except Exception as e:
                print(f"Error en predicción de {disease}: {e}")
