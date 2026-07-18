from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import EntityStatus

class ReportBase(BaseModel):
    name: str
    report_type: str
    parameters_json: Optional[str] = None # ZCQL/Catalyst standard text column for JSON
    created_by_officer_id: str
    status: EntityStatus = EntityStatus.ACTIVE

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    name: Optional[str] = None
    report_type: Optional[str] = None
    parameters_json: Optional[str] = None
    created_by_officer_id: Optional[str] = None
    status: Optional[EntityStatus] = None

class ReportResponse(ReportBase):
    ROWID: str
    CREATEDTIME: str
    MODIFIEDTIME: str
    
    model_config = ConfigDict(from_attributes=True)
