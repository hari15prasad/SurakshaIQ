from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional

from app.repositories.crime_repo import CrimeRepository
from app.schemas.hotspot import HotspotResponse, HotspotCluster
from app.schemas.prediction import HotspotPredictionResponse
from app.analytics.prediction.hotspot_model import predict_hotspots
from collections import defaultdict


class _CrimePoint:
    """Adapter for analytics functions expecting attribute-based crime rows."""

    def __init__(self, row: Dict[str, Any]):
        self.latitude = row.get("latitude")
        self.longitude = row.get("longitude")
        self.crime_type = row.get("crime_type", "UNKNOWN")


class HotspotService:
    """Hotspot clustering and prediction over Catalyst crime records."""

    def __init__(self, crime_repo: CrimeRepository | None = None):
        self.crime_repo = crime_repo or CrimeRepository()

    async def get_hotspots(
        self,
        officer: Dict[str, Any],
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> HotspotResponse:
        del officer
        if not end_date:
            end_date = datetime.now(timezone.utc)
        if not start_date:
            start_date = end_date - timedelta(days=30)

        crimes = await self.crime_repo.find_all(limit=10000)
        clusters = self._generate_grid_clusters(crimes)

        return HotspotResponse(
            clusters=clusters,
            start_date=start_date,
            end_date=end_date,
        )

    async def predict_hotspots(self, officer: Dict[str, Any]) -> HotspotPredictionResponse:
        del officer
        crimes = await self.crime_repo.find_all(limit=10000)
        current_clusters = self._generate_grid_clusters(crimes)
        past_clusters = current_clusters
        predictions = predict_hotspots(current_clusters, past_clusters, timeframe_days=7)
        return HotspotPredictionResponse(predictions=predictions)

    def _generate_grid_clusters(
        self, crimes: List[Dict[str, Any]], grid_precision: int = 2
    ) -> List[HotspotCluster]:
        clusters_map: Dict[str, Dict[str, Any]] = defaultdict(
            lambda: {
                "lat_sum": 0.0,
                "lon_sum": 0.0,
                "crime_count": 0,
                "crime_types": defaultdict(int),
            }
        )

        for row in crimes:
            crime = _CrimePoint(row)
            if crime.latitude is None or crime.longitude is None:
                continue

            grid_lat = round(float(crime.latitude), grid_precision)
            grid_lon = round(float(crime.longitude), grid_precision)
            grid_key = f"{grid_lat}_{grid_lon}"

            clusters_map[grid_key]["lat_sum"] += float(crime.latitude)
            clusters_map[grid_key]["lon_sum"] += float(crime.longitude)
            clusters_map[grid_key]["crime_count"] += 1
            clusters_map[grid_key]["crime_types"][crime.crime_type] += 1

        results: List[HotspotCluster] = []
        for key, data in clusters_map.items():
            count = data["crime_count"]
            centroid_lat = data["lat_sum"] / count
            centroid_lon = data["lon_sum"] / count
            sorted_types = sorted(data["crime_types"].items(), key=lambda x: x[1], reverse=True)
            primary_types = [t[0] for t in sorted_types[:3]]
            radius = 500.0 + (min(count, 100) * 10)
            intensity = min((count / 10.0) * 100, 100.0)

            results.append(
                HotspotCluster(
                    id=key,
                    latitude=centroid_lat,
                    longitude=centroid_lon,
                    radius_meters=radius,
                    intensity_score=round(intensity, 1),
                    crime_count=count,
                    primary_crime_types=primary_types,
                )
            )

        return sorted(results, key=lambda x: x.intensity_score, reverse=True)
