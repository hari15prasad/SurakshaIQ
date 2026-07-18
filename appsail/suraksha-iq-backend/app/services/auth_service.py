from typing import Dict, Any

from app.models.enums import ROLE_PERMISSIONS_MAP, Role
from app.repositories.officer_repo import OfficerRepository
from app.security.jwt import create_access_token
from app.services.officer_service import OfficerService


class AuthService:
    """Authentication orchestration over Catalyst-backed officer records."""

    def __init__(self, officer_repo: OfficerRepository | None = None):
        self.officer_repo = officer_repo or OfficerRepository()
        self.officer_service = OfficerService(self.officer_repo)

    async def verify_catalyst_and_issue_token(
        self, catalyst_identity: Dict[str, Any]
    ) -> Dict[str, Any]:
        officer = await self.officer_service.sync_catalyst_identity(catalyst_identity)

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
            "permissions": [p.value for p in permissions],
        }

        access_token = create_access_token(token_payload)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "officer": officer,
        }

    async def get_current_officer_profile(self, officer: Dict[str, Any]) -> Dict[str, Any]:
        return officer
