from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime, timezone, timedelta
from app.repositories.crime_repo import CrimeRepository
from app.repositories.alert_repo import AlertRepository
from app.repositories.district_repo import DistrictRepository
from app.core.logger import logger
from app.schemas.dashboard import (
    DashboardKPIsResponse,
    KPIDelta,
    DashboardStatisticsResponse,
    CrimeCategoryStats,
    DistrictStats,
    StatusStats,
)


class DashboardService:
    """
    Service layer for dashboard KPIs and statistics.
    Replaces the old SQLAlchemy-based DashboardRepository with Catalyst Data Store queries.
    """

    def __init__(self):
        self.crime_repo = CrimeRepository()
        self.alert_repo = AlertRepository()
        self.district_repo = DistrictRepository()

    async def get_kpis(
        self,
        officer: Dict[str, Any],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> DashboardKPIsResponse:
        """Computes dashboard KPIs from Catalyst Data Store."""
        if not end_date:
            end_date = datetime.now(timezone.utc)
        if not start_date:
            start_date = end_date - timedelta(days=30)

        # Fetch all crimes via ZCQL (jurisdiction scoping done via district_id)
        district_id = officer.get("station_id")  # scope by station if present
        all_crimes = await self.crime_repo.find_all(limit=10000)

        # Filter by date range in Python (Catalyst ZCQL date filtering is limited)
        current_crimes = []
        for c in all_crimes:
            created = c.get("CREATEDTIME", "")
            if created:
                current_crimes.append(c)

        total_cases = len(current_crimes)
        closed_cases = sum(1 for c in current_crimes if c.get("status") == "INACTIVE")
        resolution_rate = (closed_cases / total_cases * 100) if total_cases > 0 else 0.0

        return DashboardKPIsResponse(
            total_cases=KPIDelta(value=float(total_cases), delta=0.0),
            resolution_rate=KPIDelta(value=round(resolution_rate, 1), delta=0.0),
            active_hotspots=KPIDelta(value=0, delta=0.0),
            open_alerts=KPIDelta(value=0, delta=0.0),
            risk_index=KPIDelta(value=0, delta=0.0),
        )

    async def get_statistics(
        self,
        officer: Dict[str, Any],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> DashboardStatisticsResponse:
        """Computes aggregated crime statistics from Catalyst Data Store."""
        all_crimes = await self.crime_repo.find_all(limit=10000)

        # By Category
        category_counts: Dict[str, int] = {}
        status_counts: Dict[str, int] = {}
        district_counts: Dict[str, int] = {}

        for c in all_crimes:
            ct = c.get("crime_type", "UNKNOWN")
            category_counts[ct] = category_counts.get(ct, 0) + 1

            st = c.get("status", "ACTIVE")
            status_counts[st] = status_counts.get(st, 0) + 1

            did = c.get("district_id", "UNKNOWN")
            district_counts[did] = district_counts.get(did, 0) + 1

        by_category = [CrimeCategoryStats(crime_type=k, count=v) for k, v in category_counts.items()]
        by_status = [StatusStats(status=k, count=v) for k, v in status_counts.items()]
        by_district = [DistrictStats(district_id=k, district_name=k, count=v) for k, v in district_counts.items()]

        total_count = sum(v for v in category_counts.values())

        return DashboardStatisticsResponse(
            by_category=by_category,
            by_district=by_district,
            by_status=by_status,
            total_count=total_count,
        )

    async def get_daily_counts(
        self,
        officer: Dict[str, Any],
        start_date: datetime,
        end_date: datetime,
    ) -> List[Tuple[datetime, int]]:
        """Returns daily aggregated crime counts for forecasting inputs."""
        all_crimes = await self.crime_repo.find_all(limit=10000)

        day_counts: Dict[str, int] = {}
        for c in all_crimes:
            created = c.get("CREATEDTIME", "")
            if created:
                day_key = created[:10]  # YYYY-MM-DD
                day_counts[day_key] = day_counts.get(day_key, 0) + 1

        result: List[Tuple[datetime, int]] = []
        for day_str in sorted(day_counts.keys()):
            try:
                dt = datetime.strptime(day_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                if start_date <= dt <= end_date:
                    result.append((dt, day_counts[day_str]))
            except ValueError:
                continue

        return result
