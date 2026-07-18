from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, Any, List

from app.api.deps import get_current_officer
from app.repositories.alert_repo import AlertRepository
from app.schemas.alert import AlertResponse

router = APIRouter()

@router.get(
    "/",
    response_model=List[AlertResponse],
    summary="Get Alerts",
    description="Retrieves a list of alerts (anomalies, hotspots, etc.)."
)
async def get_alerts(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (e.g. ACTIVE)"),
    severity: Optional[str] = Query(None, description="Filter by severity (e.g. HIGH)"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves alerts scoped by jurisdiction."""
    try:
        repo = AlertRepository()

        if status_filter:
            alerts = await repo.find_active(limit=limit, offset=offset)
        else:
            alerts = await repo.find_all(limit=limit)

        return [AlertResponse.model_validate(a) for a in alerts]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch alerts: {str(e)}"
        )
