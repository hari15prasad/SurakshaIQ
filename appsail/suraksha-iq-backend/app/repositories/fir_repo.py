from typing import List, Dict, Any, Optional
from app.repositories.base_repository import BaseCatalystRepository
from app.core.exceptions import RepositoryError
from zcatalyst_sdk.exceptions import CatalystError
from app.core.logger import logger

class FIRRepository(BaseCatalystRepository):
    """
    Repository for FIR entity backed by Catalyst Data Store.
    """
    def __init__(self):
        super().__init__(table_name="FIR")

    async def find_by_number(self, fir_number: str) -> Optional[Dict[str, Any]]:
        """Retrieves an FIR by its unique FIR number."""
        try:
            query = f"SELECT * FROM {self.table_name} WHERE fir_number = '{fir_number}' LIMIT 1"
            result = self.zcql.execute_query(query)
            if result and len(result) > 0:
                return result[0].get(self.table_name)
            return None
        except CatalystError as e:
            logger.error(f"Error fetching FIR by number {fir_number}: {e}")
            raise RepositoryError(f"Failed to fetch FIR by number: {e}")

    async def find_by_station(self, station_id: str, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves FIRs scoped to a specific police station."""
        try:
            offset_val = offset if offset > 0 else 1
            query = f"SELECT * FROM {self.table_name} WHERE station_id = '{station_id}' ORDER BY {sort_by} {sort_order} LIMIT {offset_val}, {limit}"
            result = self.zcql.execute_query(query)
            
            rows = []
            for item in result:
                if self.table_name in item:
                    rows.append(item[self.table_name])
            return rows
        except CatalystError as e:
            logger.error(f"Error fetching FIRs for station {station_id}: {e}")
            raise RepositoryError(f"Failed to fetch station FIRs: {e}")

    async def search(self, search_term: str, station_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Performs a text search on FIR number or description."""
        try:
            query = (
                f"SELECT * FROM {self.table_name} "
                f"WHERE (fir_number LIKE '%{search_term}%' "
                f"OR description LIKE '%{search_term}%')"
            )
            if station_id:
                query += f" AND station_id = '{station_id}'"
            query += f" LIMIT {limit}"
            
            result = self.zcql.execute_query(query)
            
            rows = []
            for item in result:
                if self.table_name in item:
                    rows.append(item[self.table_name])
            return rows
        except CatalystError as e:
            logger.error(f"Error searching FIRs with term '{search_term}': {e}")
            raise RepositoryError(f"Failed to search FIRs: {e}")

    async def find_all_with_filters(
        self,
        limit: int = 100,
        offset: int = 0,
        fir_number: Optional[str] = None,
        district_id: Optional[str] = None,
        station_id: Optional[str] = None,
        officer_id: Optional[str] = None,
        status: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        sort_by: str = "CREATEDTIME",
        sort_order: str = "DESC",
    ) -> List[Dict[str, Any]]:
        """Retrieves FIRs with optional filters."""
        try:
            offset_val = offset if offset > 0 else 1
            query = f"SELECT * FROM {self.table_name} WHERE 1=1"
            
            if fir_number:
                query += f" AND fir_number LIKE '%{fir_number}%'"
            if district_id:
                query += f" AND district_id = '{district_id}'"
            if station_id:
                query += f" AND station_id = '{station_id}'"
            if officer_id:
                query += f" AND officer_id = '{officer_id}'"
            if status:
                query += f" AND status = '{status}'"
            if date_from:
                query += f" AND CREATEDTIME >= '{date_from}'"
            if date_to:
                query += f" AND CREATEDTIME <= '{date_to}'"
            
            query += f" ORDER BY {sort_by} {sort_order} LIMIT {offset_val}, {limit}"
            
            result = self.zcql.execute_query(query)
            
            rows = []
            for item in result:
                if self.table_name in item:
                    rows.append(item[self.table_name])
            return rows
        except CatalystError as e:
            logger.error(f"Error fetching filtered FIRs: {e}")
            raise RepositoryError(f"Failed to fetch filtered FIRs: {e}")
