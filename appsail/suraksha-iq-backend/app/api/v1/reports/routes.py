from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, Any, List

from app.api.deps import get_current_officer
from app.repositories.report_repo import ReportRepository
from app.schemas.report import ReportResponse

router = APIRouter()

@router.get(
    "/",
    response_model=List[ReportResponse],
    summary="Get Reports",
    description="Retrieves a paginated list of report configurations."
)
async def get_reports(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves reports from Catalyst Data Store."""
    try:
        offset = (page - 1) * size
        repo = ReportRepository()
        reports = await repo.find_recent(limit=size, offset=offset)
        return [ReportResponse.model_validate(r) for r in reports]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch reports: {str(e)}"
        )

@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get Report Details",
    description="Retrieves specific report metadata."
)
async def get_report_details(
    report_id: str,
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves report details from Catalyst Data Store."""
    try:
        repo = ReportRepository()
        report = await repo.find_by_id(report_id)

        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

        return ReportResponse.model_validate(report)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch report details: {str(e)}"
        )
