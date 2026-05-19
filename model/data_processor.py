"""
Procesador de Datos para Vigilancia Tropical
Este módulo maneja el procesamiento, limpieza y análisis de datos epidemiológicos
para el sistema de vigilancia de enfermedades tropicales en Quibdó, Chocó.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
import re
from pathlib import Path

class EpidemiologicalDataProcessor:
    """
    Clase para procesar y analizar datos epidemiológicos
    """
    
    def __init__(self):
        self.data = None
        self.processed_data = None
        self.metadata = {
            'last_updated': None,
            'total_records': 0,
            'date_range': None,
            'diseases': [],
            'locations': []
        }
    
    def load_data(self, file_path: str, file_type: str = 'json') -> bool:
        """
        Carga datos desde un archivo
        
        Args:
            file_path: Ruta del archivo
            file_type: Tipo de archivo ('json', 'csv', 'excel')
            
        Returns:
            True si los datos se cargaron exitosamente
        """
        try:
            if file_type.lower() == 'json':
                with open(file_path, 'r', encoding='utf-8') as f:
                    raw_data = json.load(f)
                
                # Convertir a DataFrame
                if isinstance(raw_data, list):
                    self.data = pd.DataFrame(raw_data)
                elif isinstance(raw_data, dict) and 'data' in raw_data:
                    self.data = pd.DataFrame(raw_data['data'])
                else:
                    self.data = pd.DataFrame([raw_data])
            
            elif file_type.lower() == 'csv':
                self.data = pd.read_csv(file_path, encoding='utf-8')
            
            elif file_type.lower() in ['excel', 'xlsx']:
                self.data = pd.read_excel(file_path)
            
            else:
                raise ValueError(f"Tipo de archivo '{file_type}' no soportado")
            
            self._update_metadata()
            return True
            
        except Exception as e:
            print(f"Error al cargar datos: {e}")
            return False
    
    def clean_data(self) -> Dict:
        """
        Limpia y estandariza los datos
        
        Returns:
            Diccionario con estadísticas de limpieza
        """
        if self.data is None:
            raise ValueError("No hay datos cargados")
        
        cleaning_stats = {
            'original_records': len(self.data),
            'duplicates_removed': 0,
            'missing_values_filled': 0,
            'outliers_handled': 0,
            'final_records': 0
        }
        
        # Hacer copia para no modificar datos originales
        df = self.data.copy()
        
        # 1. Eliminar duplicados
        original_len = len(df)
        df = df.drop_duplicates()
        cleaning_stats['duplicates_removed'] = original_len - len(df)
        
        # 2. Estandarizar nombres de columnas
        df.columns = [self._standardize_column_name(col) for col in df.columns]
        
        # 3. Limpiar y estandarizar datos de fechas
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            df = df.dropna(subset=['date'])
            df = df.sort_values('date')
        
        # 4. Llenar valores faltantes
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        for col in numeric_columns:
            if col != 'cases':  # No llenar casos con promedio
                missing_count = df[col].isnull().sum()
                if missing_count > 0:
                    df[col] = df[col].fillna(df[col].median())
                    cleaning_stats['missing_values_filled'] += missing_count
        
        # 5. Manejar valores atípicos en casos
        if 'cases' in df.columns:
            # Usar método IQR para detectar outliers
            Q1 = df['cases'].quantile(0.25)
            Q3 = df['cases'].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = df[(df['cases'] < lower_bound) | (df['cases'] > upper_bound)]
            cleaning_stats['outliers_handled'] = len(outliers)
            
            # Capar valores extremos
            df['cases'] = df['cases'].clip(lower_bound, upper_bound)
        
        # 6. Estandarizar nombres de enfermedades
        if 'disease' in df.columns:
            df['disease'] = df['disease'].str.lower().str.strip()
        
        # 7. Estandarizar nombres de ubicaciones
        if 'location' in df.columns:
            df['location'] = df['location'].str.title().str.strip()
        
        self.processed_data = df
        cleaning_stats['final_records'] = len(df)
        
        return cleaning_stats
    
    def _standardize_column_name(self, column_name: str) -> str:
        """
        Estandariza nombres de columnas
        """
        # Convertir a minúsculas y reemplazar espacios con guiones bajos
        standardized = re.sub(r'[^\w\s]', '', column_name.lower())
        standardized = re.sub(r'\s+', '_', standardized)
        
        # Mapeo de nombres comunes
        column_mapping = {
            'fecha': 'date',
            'casos': 'cases',
            'enfermedad': 'disease',
            'ubicacion': 'location',
            'latitud': 'lat',
            'longitud': 'lng',
            'lat': 'latitude',
            'lng': 'longitude',
            'temperatura': 'temperature',
            'humedad': 'humidity',
            'lluvia': 'rainfall'
        }
        
        return column_mapping.get(standardized, standardized)
    
    def aggregate_data(self, group_by: List[str], agg_functions: Dict = None) -> pd.DataFrame:
        """
        Agrega datos según criterios especificados
        
        Args:
            group_by: Columnas para agrupar
            agg_functions: Funciones de agregación
            
        Returns:
            DataFrame agregado
        """
        if self.processed_data is None:
            raise ValueError("No hay datos procesados")
        
        if agg_functions is None:
            agg_functions = {
                'cases': ['sum', 'mean', 'max', 'min'],
                'temperature': ['mean', 'min', 'max'] if 'temperature' in self.processed_data.columns else None,
                'humidity': ['mean', 'min', 'max'] if 'humidity' in self.processed_data.columns else None,
                'rainfall': ['sum', 'mean'] if 'rainfall' in self.processed_data.columns else None
            }
        
        # Filtrar funciones None
        agg_functions = {k: v for k, v in agg_functions.items() if v is not None}
        
        # Agrupar y agregar
        aggregated = self.processed_data.groupby(group_by).agg(agg_functions)
        
        # Aplanar nombres de columnas multinivel
        aggregated.columns = ['_'.join(col).strip() for col in aggregated.columns.values]
        aggregated = aggregated.reset_index()
        
        return aggregated
    
    def calculate_indicators(self) -> Dict:
        """
        Calcula indicadores epidemiológicos
        
        Returns:
            Diccionario con indicadores calculados
        """
        if self.processed_data is None:
            raise ValueError("No hay datos procesados")
        
        indicators = {}
        
        # Indicadores generales
        indicators['total_cases'] = self.processed_data['cases'].sum()
        indicators['average_daily_cases'] = self.processed_data['cases'].mean()
        indicators['max_daily_cases'] = self.processed_data['cases'].max()
        indicators['min_daily_cases'] = self.processed_data['cases'].min()
        
        # Indicadores por enfermedad
        if 'disease' in self.processed_data.columns:
            disease_stats = self.processed_data.groupby('disease')['cases'].agg([
                'sum', 'mean', 'max', 'min', 'count'
            ]).to_dict()
            indicators['by_disease'] = disease_stats
        
        # Indicadores por ubicación
        if 'location' in self.processed_data.columns:
            location_stats = self.processed_data.groupby('location')['cases'].agg([
                'sum', 'mean', 'max', 'count'
            ]).to_dict()
            indicators['by_location'] = location_stats
        
        # Tendencia temporal
        if 'date' in self.processed_data.columns:
            # Últimos 7 días vs 7 días anteriores
            latest_date = self.processed_data['date'].max()
            recent_cases = self.processed_data[
                self.processed_data['date'] > (latest_date - timedelta(days=7))
            ]['cases'].sum()
            
            previous_cases = self.processed_data[
                (self.processed_data['date'] > (latest_date - timedelta(days=14))) &
                (self.processed_data['date'] <= (latest_date - timedelta(days=7)))
            ]['cases'].sum()
            
            indicators['recent_trend'] = {
                'last_7_days': recent_cases,
                'previous_7_days': previous_cases,
                'trend_percentage': ((recent_cases - previous_cases) / previous_cases * 100) if previous_cases > 0 else 0
            }
        
        # Coeficiente de variación
        indicators['coefficient_of_variation'] = (
            self.processed_data['cases'].std() / self.processed_data['cases'].mean()
        ) if self.processed_data['cases'].mean() > 0 else 0
        
        return indicators
    
    def detect_outbreaks(self, threshold_multiplier: float = 2.0) -> List[Dict]:
        """
        Detecta posibles brotes basados en umbrales estadísticos
        
        Args:
            threshold_multiplier: Multiplicador para el umbral de detección
            
        Returns:
            Lista de posibles brotes detectados
        """
        if self.processed_data is None:
            raise ValueError("No hay datos procesados")
        
        outbreaks = []
        
        # Agrupar por enfermedad y ubicación si es posible
        group_columns = []
        if 'disease' in self.processed_data.columns:
            group_columns.append('disease')
        if 'location' in self.processed_data.columns:
            group_columns.append('location')
        
        if group_columns:
            groups = self.processed_data.groupby(group_columns)
        else:
            groups = [(None, self.processed_data)]
        
        for group_key, group_data in groups:
            # Calcular umbral basado en media y desviación estándar
            mean_cases = group_data['cases'].mean()
            std_cases = group_data['cases'].std()
            threshold = mean_cases + (threshold_multiplier * std_cases)
            
            # Identificar días que exceden el umbral
            outbreak_days = group_data[group_data['cases'] > threshold]
            
            if not outbreak_days.empty:
                outbreak_info = {
                    'disease': group_key[0] if len(group_key) > 0 else 'unknown',
                    'location': group_key[1] if len(group_key) > 1 else 'unknown',
                    'threshold': threshold,
                    'mean_cases': mean_cases,
                    'outbreak_days': outbreak_days[['date', 'cases']].to_dict('records'),
                    'max_cases': outbreak_days['cases'].max(),
                    'total_outbreak_cases': outbreak_days['cases'].sum()
                }
                outbreaks.append(outbreak_info)
        
        return outbreaks
    
    def generate_summary_report(self) -> Dict:
        """
        Genera un resumen completo de los datos
        
        Returns:
            Diccionario con resumen de datos
        """
        if self.processed_data is None:
            raise ValueError("No hay datos procesados")
        
        summary = {
            'metadata': self.metadata,
            'indicators': self.calculate_indicators(),
            'outbreaks': self.detect_outbreaks(),
            'data_quality': self._assess_data_quality()
        }
        
        return summary
    
    def _assess_data_quality(self) -> Dict:
        """
        Evalúa la calidad de los datos
        
        Returns:
            Diccionario con métricas de calidad
        """
        quality_metrics = {
            'completeness': 0,
            'consistency': 0,
            'timeliness': 0,
            'validity': 0
        }
        
        # Completitud: porcentaje de valores no nulos
        total_cells = len(self.processed_data) * len(self.processed_data.columns)
        non_null_cells = total_cells - self.processed_data.isnull().sum().sum()
        quality_metrics['completeness'] = (non_null_cells / total_cells) * 100
        
        # Consistencia: verificar formatos consistentes
        consistency_score = 100
        
        # Verificar fechas
        if 'date' in self.processed_data.columns:
            invalid_dates = self.processed_data['date'].isnull().sum()
            consistency_score -= (invalid_dates / len(self.processed_data)) * 20
        
        # Verificar casos no negativos
        if 'cases' in self.processed_data.columns:
            negative_cases = (self.processed_data['cases'] < 0).sum()
            consistency_score -= (negative_cases / len(self.processed_data)) * 20
        
        quality_metrics['consistency'] = max(0, consistency_score)
        
        # Oportunidad: recencia de los datos
        if 'date' in self.processed_data.columns:
            latest_date = self.processed_data['date'].max()
            days_since_latest = (datetime.now() - latest_date).days
            timeliness_score = max(0, 100 - (days_since_latest * 2))  # Penalizar datos antiguos
            quality_metrics['timeliness'] = timeliness_score
        
        # Validez: rangos lógicos
        validity_score = 100
        
        if 'cases' in self.processed_data.columns:
            # Verificar casos no negativos
            negative_cases = (self.processed_data['cases'] < 0).sum()
            validity_score -= (negative_cases / len(self.processed_data)) * 30
        
        if 'temperature' in self.processed_data.columns:
            # Verificar rangos de temperatura razonables (-10 a 50°C)
            invalid_temp = ((self.processed_data['temperature'] < -10) | 
                           (self.processed_data['temperature'] > 50)).sum()
            validity_score -= (invalid_temp / len(self.processed_data)) * 20
        
        quality_metrics['validity'] = max(0, validity_score)
        
        return quality_metrics
    
    def _update_metadata(self):
        """
        Actualiza metadatos del dataset
        """
        if self.data is not None:
            self.metadata['last_updated'] = datetime.now().isoformat()
            self.metadata['total_records'] = len(self.data)
            
            if 'date' in self.data.columns:
                dates = pd.to_datetime(self.data['date'], errors='coerce')
                valid_dates = dates.dropna()
                if not valid_dates.empty:
                    self.metadata['date_range'] = {
                        'start': valid_dates.min().strftime('%Y-%m-%d'),
                        'end': valid_dates.max().strftime('%Y-%m-%d')
                    }
            
            if 'disease' in self.data.columns:
                self.metadata['diseases'] = self.data['disease'].unique().tolist()
            
            if 'location' in self.data.columns:
                self.metadata['locations'] = self.data['location'].unique().tolist()
    
    def export_processed_data(self, file_path: str, file_type: str = 'json') -> bool:
        """
        Exporta los datos procesados
        
        Args:
            file_path: Ruta del archivo de salida
            file_type: Tipo de archivo ('json', 'csv', 'excel')
            
        Returns:
            True si se exportó exitosamente
        """
        if self.processed_data is None:
            raise ValueError("No hay datos procesados para exportar")
        
        try:
            if file_type.lower() == 'json':
                # Convertir DataFrame a formato JSON
                data_dict = {
                    'metadata': self.metadata,
                    'data': self.processed_data.to_dict('records')
                }
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(data_dict, f, indent=2, ensure_ascii=False, default=str)
            
            elif file_type.lower() == 'csv':
                self.processed_data.to_csv(file_path, index=False, encoding='utf-8')
            
            elif file_type.lower() in ['excel', 'xlsx']:
                self.processed_data.to_excel(file_path, index=False)
            
            else:
                raise ValueError(f"Tipo de archivo '{file_type}' no soportado")
            
            return True
            
        except Exception as e:
            print(f"Error al exportar datos: {e}")
            return False

# Función de utilidad para procesar datos de ejemplo
def process_sample_data():
    """
    Función de ejemplo para demostrar el procesamiento de datos
    """
    processor = EpidemiologicalDataProcessor()
    
    # Generar datos de ejemplo
    sample_data = []
    base_date = datetime.now() - timedelta(days=90)
    
    diseases = ['dengue', 'malaria', 'zika', 'chikungunya']
    locations = ['Centro', 'El Pato', 'La Esperanza', 'San Francisco', 'Barrio Obrero']
    
    for i in range(90):
        date = base_date + timedelta(days=i)
        
        for disease in diseases:
            for location in locations:
                # Simular casos con variación estacional
                base_cases = np.random.randint(1, 20)
                seasonal_factor = 1 + 0.3 * np.sin(2 * np.pi * i / 30)
                cases = max(1, int(base_cases * seasonal_factor))
                
                sample_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'disease': disease,
                    'location': location,
                    'cases': cases,
                    'temperature': 25 + 5 * np.sin(2 * np.pi * i / 30) + np.random.normal(0, 2),
                    'humidity': 80 + 10 * np.sin(2 * np.pi * i / 30) + np.random.normal(0, 5),
                    'rainfall': max(0, 150 + 100 * np.sin(2 * np.pi * i / 30) + np.random.normal(0, 30))
                })
    
    # Guardar datos de ejemplo
    with open('data/sample_epidemiological_data.json', 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, indent=2, ensure_ascii=False)
    
    # Procesar datos
    processor.load_data('data/sample_epidemiological_data.json', 'json')
    cleaning_stats = processor.clean_data()
    
    print("📊 Estadísticas de limpieza:")
    for key, value in cleaning_stats.items():
        print(f"   {key}: {value}")
    
    # Generar resumen
    summary = processor.generate_summary_report()
    
    print("\n📈 Indicadores principales:")
    print(f"   Total de casos: {summary['indicators']['total_cases']}")
    print(f"   Promedio diario: {summary['indicators']['average_daily_cases']:.1f}")
    print(f"   Tendencia reciente: {summary['indicators']['recent_trend']['trend_percentage']:.1f}%")
    
    print("\n🚨 Brotes detectados:")
    for outbreak in summary['outbreaks']:
        print(f"   {outbreak['disease']} en {outbreak['location']}: {outbreak['max_cases']} casos máximos")
    
    print("\n✅ Calidad de datos:")
    for metric, value in summary['data_quality'].items():
        print(f"   {metric}: {value:.1f}%")
    
    return processor, summary

if __name__ == "__main__":
    processor, summary = process_sample_data()
