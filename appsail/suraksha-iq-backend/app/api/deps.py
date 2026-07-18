from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.security.jwt import verify_access_token, TokenPayload
from app.repositories.officer_repo import OfficerRepository
from app.models.enums import Role, Permission, ROLE_PERMISSIONS_MAP
from app.core.logger import logger
from typing import Dict, Any

oauth2_scheme = HTTPBearer()

async def get_current_officer(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
) -> Dict[str, Any]:
    """
    Validates the JWT token and retrieves the Officer from Catalyst Data Store.
    Returns a dict with officer data from Catalyst.
    Throws 401 if token is invalid or officer doesn't exist.
    """
    token_payload_dict = verify_access_token(credentials.credentials)
    token_data = TokenPayload(**token_payload_dict)
    
    repo = OfficerRepository()
    officer = await repo.find_by_user_id(token_data.cat_id)
    if not officer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Officer not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return officer

class RequireRole:
    """
    Dependency class to enforce Role-based access control.
    """
    def __init__(self, allowed_roles: list[Role]):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_officer: Dict[str, Any] = Depends(get_current_officer)) -> Dict[str, Any]:
        officer_role = current_officer.get("role", "")
        if officer_role not in [r.value for r in self.allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {[r.value for r in self.allowed_roles]}"
            )
        return current_officer

class RequirePermission:
    """
    Dependency class to enforce Permission-based access control.
    Uses the centralized ROLE_PERMISSIONS_MAP to determine if the officer has the permission.
    """
    def __init__(self, required_permissions: list[Permission]):
        self.required_permissions = required_permissions

    async def __call__(self, current_officer: Dict[str, Any] = Depends(get_current_officer)) -> Dict[str, Any]:
        officer_role_str = current_officer.get("role", "")
        try:
            officer_role = Role(officer_role_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Unknown role: {officer_role_str}"
            )
        
        officer_permissions = ROLE_PERMISSIONS_MAP.get(officer_role, [])
        
        for perm in self.required_permissions:
            if perm not in officer_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Operation not permitted. Missing permission: {perm.value}"
                )
        return current_officer
