from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class AnomalyFactor(BaseModel):
    name: str
    weight: float
    contribution: float

    model_config = ConfigDict(from_attributes=True)

class Anomaly(BaseModel):
    anomaly_id: str
    anomaly_type: str
    severity: str
    affected_entity_id: str
    affected_entity_type: str
    affected_entity_name: str
    anomaly_score: float
    contributing_factors: List[AnomalyFactor]
    description: str
    detected_at: str

    model_config = ConfigDict(from_attributes=True)

class DistrictAnomaly(BaseModel):
    district_id: str
    district_name: str
    anomaly_score: float
    severity: str
    crime_count: int
    fir_count: int
    hotspot_score: float
    contributing_factors: List[AnomalyFactor]

    model_config = ConfigDict(from_attributes=True)

class StationAnomaly(BaseModel):
    station_id: str
    station_name: str
    district_id: str
    district_name: str
    anomaly_score: float
    severity: str
    crime_count: int
    fir_count: int
    hotspot_score: float
    contributing_factors: List[AnomalyFactor]

    model_config = ConfigDict(from_attributes=True)

class AnomalySummary(BaseModel):
    total_anomalies: int
    high_anomalies: int
    critical_anomalies: int
    affected_districts: int
    affected_stations: int
    average_anomaly_score: float
    anomaly_distribution: List[dict]

    model_config = ConfigDict(from_attributes=True)
