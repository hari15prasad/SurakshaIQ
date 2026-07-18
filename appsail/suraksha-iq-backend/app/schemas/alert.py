from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import EntityStatus

class AlertBase(BaseModel):
    type: str
    severity: str
    message: str
    district_id: Optional[str] = None
    status: EntityStatus = EntityStatus.ACTIVE

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    type: Optional[str] = None
    severity: Optional[str] = None
    message: Optional[str] = None
    district_id: Optional[str] = None
    status: Optional[EntityStatus] = None

class AlertResponse(AlertBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
