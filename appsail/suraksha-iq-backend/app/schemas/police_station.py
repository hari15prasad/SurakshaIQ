from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import EntityStatus

class PoliceStationBase(BaseModel):
    name: str
    code: str
    district_id: str
    status: EntityStatus = EntityStatus.ACTIVE

class PoliceStationCreate(PoliceStationBase):
    pass

class PoliceStationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    district_id: Optional[str] = None
    status: Optional[EntityStatus] = None

class PoliceStationResponse(PoliceStationBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
