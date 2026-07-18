from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta

from app.api.deps import get_current_officer
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import DashboardKPIsResponse, DashboardStatisticsResponse
from app.schemas.forecast import ForecastResponse
from app.analytics.prediction.trend_model import generate_trend_forecast

router = APIRouter()

@router.get(
    "/kpis",
    response_model=DashboardKPIsResponse,
    summary="Get Dashboard KPIs",
    description="Retrieves key performance indicators for the dashboard, scoped by the requesting officer's jurisdiction."
)
async def get_dashboard_kpis(
    start_date: Optional[datetime] = Query(None, description="Start date for KPI filtering (UTC)"),
    end_date: Optional[datetime] = Query(None, description="End date for KPI filtering (UTC)"),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves dashboard KPIs from Catalyst Data Store."""
    try:
        service = DashboardService()
        kpis = await service.get_kpis(current_user, start_date, end_date)
        return kpis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch KPIs: {str(e)}"
        )

@router.get(
    "/statistics",
    response_model=DashboardStatisticsResponse,
    summary="Get Dashboard Statistics",
    description="Retrieves aggregated crime statistics broken down by category, district, and status."
)
async def get_dashboard_statistics(
    start_date: Optional[datetime] = Query(None, description="Start date for statistics filtering (UTC)"),
    end_date: Optional[datetime] = Query(None, description="End date for statistics filtering (UTC)"),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves dashboard statistics from Catalyst Data Store."""
    try:
        service = DashboardService()
        stats = await service.get_statistics(current_user, start_date, end_date)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )

@router.get(
    "/forecast",
    response_model=ForecastResponse,
    summary="Get Crime Trend Forecast",
    description="Forecasts future crime trends based on historical counts and jurisdiction scoping."
)
async def get_dashboard_forecast(
    horizon_days: int = Query(7, ge=1, le=30, description="Days to forecast into the future"),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Generates a crime trend forecast from Catalyst Data Store."""
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=90)
        
        service = DashboardService()
        daily_counts = await service.get_daily_counts(current_user, start_date, end_date)
        
        forecast_points = generate_trend_forecast(daily_counts, horizon_days=horizon_days)
        
        return ForecastResponse(
            category="total_crimes",
            horizon_days=horizon_days,
            data=forecast_points
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate forecast: {str(e)}"
        )
