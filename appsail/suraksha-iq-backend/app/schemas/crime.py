from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import EntityStatus

class CrimeBase(BaseModel):
    title: str
    description: str
    crime_type: str
    location: str
    district_id: str
    station_id: str
    status: EntityStatus = EntityStatus.ACTIVE

class CrimeCreate(CrimeBase):
    pass

class CrimeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    crime_type: Optional[str] = None
    location: Optional[str] = None
    district_id: Optional[str] = None
    station_id: Optional[str] = None
    status: Optional[EntityStatus] = None

class CrimeResponse(CrimeBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
