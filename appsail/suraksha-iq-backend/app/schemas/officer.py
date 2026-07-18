from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from app.models.enums import Role
from app.schemas.enums import EntityStatus

class OfficerBase(BaseModel):
    name: str
    email: EmailStr
    role: Role
    badge_number: str
    station_id: Optional[str] = None
    user_id: str
    status: EntityStatus = EntityStatus.ACTIVE
    rank: Optional[str] = None
    designation: Optional[str] = None

class OfficerCreate(OfficerBase):
    pass

class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Role] = None
    badge_number: Optional[str] = None
    station_id: Optional[str] = None
    user_id: Optional[str] = None
    status: Optional[EntityStatus] = None
    rank: Optional[str] = None
    designation: Optional[str] = None

class OfficerResponse(OfficerBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
