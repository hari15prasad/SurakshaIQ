from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import EntityStatus

class CriminalBase(BaseModel):
    name: str
    alias: Optional[str] = None
    age: Optional[int] = None
    last_known_location: Optional[str] = None
    risk_level: str
    status: EntityStatus = EntityStatus.ACTIVE

class CriminalCreate(CriminalBase):
    pass

class CriminalUpdate(BaseModel):
    name: Optional[str] = None
    alias: Optional[str] = None
    age: Optional[int] = None
    last_known_location: Optional[str] = None
    risk_level: Optional[str] = None
    status: Optional[EntityStatus] = None

class CriminalResponse(CriminalBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
