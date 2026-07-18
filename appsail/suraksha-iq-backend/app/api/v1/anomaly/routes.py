from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from datetime import datetime, timezone, timedelta

from app.api.deps import get_current_officer
from app.schemas.anomaly import AnomalyDetectionResponse
from app.services.dashboard_service import DashboardService
from app.analytics.anomaly.detector import detect_anomalies
from app.repositories.alert_repo import AlertRepository

router = APIRouter()

@router.get(
    "/detect",
    response_model=AnomalyDetectionResponse,
    summary="Detect Anomalies",
    description="Runs statistical anomaly detection over the jurisdiction's recent crime trends and syncs findings to Alerts."
)
async def run_anomaly_detection(
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Runs anomaly detection using Catalyst Data Store."""
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=30)

        service = DashboardService()
        daily_counts = await service.get_daily_counts(current_user, start_date, end_date)

        district_id = current_user.get("station_id")
        officer_role = current_user.get("role", "")
        if officer_role == "STATE_COMMAND":
            district_id = None

        alert_repo = AlertRepository()
        anomalies = await detect_anomalies_catalyst(alert_repo, district_id, daily_counts)

        return AnomalyDetectionResponse(anomalies=anomalies)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to run anomaly detection: {str(e)}"
        )


async def detect_anomalies_catalyst(alert_repo: AlertRepository, district_id, daily_counts):
    """
    Wrapper that calls the anomaly detector and persists alerts to Catalyst Data Store
    instead of via SQLAlchemy.
    """
    import math
    import uuid
    from app.schemas.anomaly import AnomalyResult

    anomalies = []

    if len(daily_counts) < 7:
        return anomalies

    counts = [c for _, c in daily_counts]
    current_count = counts[-1]

    baseline_counts = counts[:-1]
    mean = sum(baseline_counts) / len(baseline_counts)
    variance = sum((x - mean) ** 2 for x in baseline_counts) / max(len(baseline_counts), 1)
    std_dev = math.sqrt(variance)

    threshold = mean + (2 * std_dev)

    if current_count > threshold and current_count > 0:
        severity = "HIGH" if current_count > mean + (3 * std_dev) else "MEDIUM"

        anomaly = AnomalyResult(
            id=str(uuid.uuid4()),
            anomaly_type="CRIME_SPIKE",
            severity=severity,
            affected_scope=f"DISTRICT:{district_id}" if district_id else "STATEWIDE",
            description=f"Unusual crime spike detected. Count {current_count} exceeds baseline mean {round(mean, 1)}.",
            detection_timestamp=datetime.now(timezone.utc),
            related_entity_id=district_id or "ALL"
        )
        anomalies.append(anomaly)

        # Persist alert to Catalyst Data Store
        existing = await alert_repo.find_active(limit=1)
        already_exists = any(
            a.get("district_id") == district_id and a.get("type") == "ANOMALY"
            for a in existing
        )

        if not already_exists:
            await alert_repo.create({
                "type": "ANOMALY",
                "severity": severity,
                "status": "ACTIVE",
                "message": anomaly.description,
                "district_id": district_id or "",
            })

    return anomalies
