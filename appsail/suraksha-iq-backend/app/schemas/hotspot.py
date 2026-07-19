from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class HotspotResponse(BaseModel):
    id: str
    district: str
    police_station: str
    crime_count: int
    hotspot_score: float
    severity: str
    latest_crime_date: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class DistrictHotspotResponse(BaseModel):
    district_id: str
    district_name: str
    total_crimes: int
    hotspot_score: float
    active_firs: int
    trend: str

    model_config = ConfigDict(from_attributes=True)

class StationHotspotResponse(BaseModel):
    station_id: str
    station_name: str
    district_id: str
    district_name: str
    crime_count: int
    hotspot_score: float
    active_firs: int

    model_config = ConfigDict(from_attributes=True)

class HotspotSummaryResponse(BaseModel):
    total_hotspots: int
    high_severity_count: int
    medium_severity_count: int
    low_severity_count: int

    model_config = ConfigDict(from_attributes=True)
