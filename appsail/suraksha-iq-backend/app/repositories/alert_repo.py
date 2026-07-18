from typing import List, Dict, Any, Optional
from app.repositories.base_repository import BaseCatalystRepository
from app.core.exceptions import RepositoryError
from zcatalyst_sdk.exceptions import CatalystError
from app.core.logger import logger

class AlertRepository(BaseCatalystRepository):
    """
    Repository for Alert entity backed by Catalyst Data Store.
    """
    def __init__(self):
        super().__init__(table_name="Alert")

    async def find_by_district(self, district_id: str, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves alerts scoped to a specific district or statewide (district_id is null)."""
        try:
            offset_val = offset if offset > 0 else 1
            query = f"SELECT * FROM {self.table_name} WHERE district_id = '{district_id}' OR district_id IS NULL ORDER BY {sort_by} {sort_order} LIMIT {offset_val}, {limit}"
            result = self.zcql.execute_query(query)
            
            rows = []
            for item in result:
                if self.table_name in item:
                    rows.append(item[self.table_name])
            return rows
        except CatalystError as e:
            logger.error(f"Error fetching alerts for district {district_id}: {e}")
            raise RepositoryError(f"Failed to fetch district alerts: {e}")

    async def find_active(self, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves active alerts with pagination."""
        try:
            offset_val = offset if offset > 0 else 1
            query = f"SELECT * FROM {self.table_name} WHERE status = 'ACTIVE' ORDER BY {sort_by} {sort_order} LIMIT {offset_val}, {limit}"
            result = self.zcql.execute_query(query)
            
            rows = []
            for item in result:
                if self.table_name in item:
                    rows.append(item[self.table_name])
            return rows
        except CatalystError as e:
            logger.error(f"Error fetching active alerts: {e}")
            raise RepositoryError(f"Failed to fetch active alerts: {e}")
