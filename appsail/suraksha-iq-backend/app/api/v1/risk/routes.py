from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.api.deps import get_current_officer
from app.repositories.criminal_repo import CriminalRepository
from app.schemas.risk import RiskScoreResponse
from app.analytics.prediction.risk_model import calculate_offender_risk

router = APIRouter()

@router.get(
    "/offender/{offender_id}",
    response_model=RiskScoreResponse,
    summary="Get Offender Risk Score",
    description="Calculates a risk score for a specific offender."
)
async def get_offender_risk(
    offender_id: str,
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Calculates offender risk score from Catalyst Data Store."""
    try:
        repo = CriminalRepository()
        offender = await repo.find_by_id(offender_id)

        if not offender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offender not found"
            )

        risk_score = calculate_offender_risk(offender)
        return risk_score
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate risk score: {str(e)}"
        )
