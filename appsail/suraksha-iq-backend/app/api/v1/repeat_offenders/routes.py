from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, Any, List

from app.api.deps import get_current_officer
from app.repositories.criminal_repo import CriminalRepository
from app.schemas.criminal import CriminalResponse

router = APIRouter()

@router.get(
    "/",
    response_model=List[CriminalResponse],
    summary="Get Repeat Offenders",
    description="Retrieves a paginated list of repeat offenders from Catalyst Data Store."
)
async def get_repeat_offenders(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves repeat offenders from Catalyst Data Store."""
    try:
        offset = (page - 1) * size
        repo = CriminalRepository()
        offenders = await repo.find_active(limit=size, offset=offset)
        return [CriminalResponse.model_validate(o) for o in offenders]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch repeat offenders: {str(e)}"
        )

@router.get(
    "/{offender_id}",
    response_model=CriminalResponse,
    summary="Get Repeat Offender Details",
    description="Retrieves detailed information for a specific offender."
)
async def get_offender_details(
    offender_id: str,
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves offender details from Catalyst Data Store."""
    try:
        repo = CriminalRepository()
        offender = await repo.find_by_id(offender_id)

        if not offender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offender not found"
            )

        return CriminalResponse.model_validate(offender)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch offender details: {str(e)}"
        )
