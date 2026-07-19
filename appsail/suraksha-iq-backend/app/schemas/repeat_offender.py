from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class RepeatOffenderResponse(BaseModel):
    offender_id: str
    offender_name: str
    total_offences: int
    fir_count: int
    districts_involved: List[str]
    police_stations_involved: List[str]
    latest_offence: Optional[str] = None
    repeat_offender_score: float

    model_config = ConfigDict(from_attributes=True)

class OffenceTimelineItem(BaseModel):
    crime_id: str
    crime_type: str
    district_id: str
    station_id: str
    offence_date: str
    fir_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RepeatOffenderDetailResponse(BaseModel):
    offender_id: str
    offender_name: str
    alias: Optional[str] = None
    age: Optional[int] = None
    last_known_location: Optional[str] = None
    risk_level: str
    status: str
    total_offences: int
    fir_count: int
    districts_involved: List[str]
    police_stations_involved: List[str]
    latest_offence: Optional[str] = None
    repeat_offender_score: float
    crime_categories: List[str]
    offence_timeline: List[OffenceTimelineItem]

    model_config = ConfigDict(from_attributes=True)

class RepeatOffenderStatisticsResponse(BaseModel):
    total_repeat_offenders: int
    average_offences: float
    highest_offence_count: int
    district_with_most_repeat_offenders: str
    repeat_offender_distribution: List[dict]

    model_config = ConfigDict(from_attributes=True)
