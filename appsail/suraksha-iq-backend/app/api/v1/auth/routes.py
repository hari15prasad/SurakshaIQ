from fastapi import APIRouter, Depends, Request, HTTPException, status
from typing import Dict, Any

from app.auth.catalyst_verifier import verify_catalyst_token
from app.services.officer_service import OfficerService
from app.security.jwt import create_access_token
from app.schemas.officer import OfficerResponse
from app.models.enums import ROLE_PERMISSIONS_MAP, Role, Permission
from app.api.deps import get_current_officer, RequirePermission

router = APIRouter()

@router.post("/verify-catalyst")
async def verify_catalyst_session(
    request: Request,
) -> Dict[str, Any]:
    """
    1. Verifies the incoming Catalyst session/token.
    2. Syncs/provisions the Officer in Catalyst Data Store.
    3. Issues a short-lived localized JWT for subsequent API calls.
    """
    catalyst_identity = verify_catalyst_token(request)
    
    officer = await OfficerService.sync_catalyst_identity(catalyst_identity)
    
    officer_role_str = officer.get("role", "STATION_HOUSE_OFFICER")
    try:
        role_enum = Role(officer_role_str)
    except ValueError:
        role_enum = Role.STATION_HOUSE_OFFICER
    
    permissions = ROLE_PERMISSIONS_MAP.get(role_enum, [])
    
    token_payload = {
        "sub": officer.get("ROWID", ""),
        "cat_id": officer.get("user_id", ""),
        "role": officer_role_str,
        "permissions": [p.value for p in permissions]
    }
    
    access_token = create_access_token(token_payload)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "officer": officer
    }

@router.post("/logout")
async def logout(request: Request):
    """
    Tears down the backend session. 
    Since JWTs are stateless, actual invalidation happens on the client by deleting the token.
    """
    return {"message": "Successfully logged out of backend session."}

@router.get("/me")
async def read_users_me(
    current_officer: Dict[str, Any] = Depends(get_current_officer)
):
    """
    Returns the currently authenticated officer.
    Guarded by `get_current_officer` which validates the JWT token.
    """
    return current_officer

@router.get("/sensitive-data")
async def read_sensitive_data(
    current_officer: Dict[str, Any] = Depends(RequirePermission([Permission.VIEW_PII]))
):
    """
    Example protected route guarded by Permission checking.
    Only roles with VIEW_PII permission will succeed.
    """
    return {"message": "You have access to sensitive PII.", "officer_id": current_officer.get("ROWID")}
