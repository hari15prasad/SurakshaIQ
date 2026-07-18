from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import EntityStatus

class FIRBase(BaseModel):
    fir_number: str
    crime_id: str
    station_id: str
    officer_id: str
    description: str
    status: EntityStatus = EntityStatus.ACTIVE

class FIRCreate(FIRBase):
    pass

class FIRUpdate(BaseModel):
    fir_number: Optional[str] = None
    crime_id: Optional[str] = None
    station_id: Optional[str] = None
    officer_id: Optional[str] = None
    description: Optional[str] = None
    status: Optional[EntityStatus] = None

class FIRResponse(FIRBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
