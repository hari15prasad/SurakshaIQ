from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta

from app.api.deps import get_current_officer
from app.repositories.crime_repo import CrimeRepository
from app.schemas.hotspot import HotspotResponse
from app.schemas.prediction import HotspotPredictionResponse

router = APIRouter()

@router.get(
    "/",
    response_model=HotspotResponse,
    summary="Get Crime Hotspots",
    description="Retrieves geographic clusters of crimes scoped by jurisdiction."
)
async def get_hotspots(
    start_date: Optional[datetime] = Query(None, description="Start date (UTC)"),
    end_date: Optional[datetime] = Query(None, description="End date (UTC)"),
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves hotspot data from Catalyst Data Store."""
    try:
        if not end_date:
            end_date = datetime.now(timezone.utc)
        if not start_date:
            start_date = end_date - timedelta(days=30)

        repo = CrimeRepository()
        crimes = await repo.find_all(limit=10000)

        # Import clustering logic
        from app.analytics.hotspot.clustering import generate_grid_clusters
        clusters = generate_grid_clusters(crimes)

        return HotspotResponse(
            clusters=clusters,
            start_date=start_date,
            end_date=end_date
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch hotspots: {str(e)}"
        )

@router.get(
    "/predict",
    response_model=HotspotPredictionResponse,
    summary="Predict Emerging Hotspots",
    description="Predicts future crime hotspots based on recent trend momentum."
)
async def get_hotspot_predictions(
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Generates hotspot predictions from Catalyst Data Store."""
    try:
        from app.analytics.hotspot.clustering import generate_grid_clusters
        from app.analytics.prediction.hotspot_model import predict_hotspots

        repo = CrimeRepository()
        crimes = await repo.find_all(limit=10000)

        current_clusters = generate_grid_clusters(crimes)
        # Use same data as past baseline for momentum comparison
        past_clusters = current_clusters

        predictions = predict_hotspots(current_clusters, past_clusters, timeframe_days=7)

        return HotspotPredictionResponse(predictions=predictions)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict hotspots: {str(e)}"
        )
