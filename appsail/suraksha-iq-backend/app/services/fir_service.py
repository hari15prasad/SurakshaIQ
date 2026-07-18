from typing import List, Dict, Any, Optional
from app.repositories.fir_repo import FIRRepository
from app.core.logger import logger
from app.core.exceptions import DataValidationError, RepositoryError

class FIRService:
    """Service layer for FIR entity."""
    
    def __init__(self, repo: FIRRepository):
        self.repo = repo

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new FIR."""
        logger.info(f"Creating FIR with data: {data}")
        return await self.repo.create(data)

    async def update(self, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Updates an existing FIR."""
        logger.info(f"Updating FIR {id}")
        return await self.repo.update(id, data)

    async def delete(self, id: str) -> bool:
        """Deletes an FIR."""
        logger.info(f"Deleting FIR {id}")
        return await self.repo.delete(id)

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an FIR by ID."""
        logger.info(f"Fetching FIR {id}")
        return await self.repo.find_by_id(id)

    async def get_all(self, limit: int = 100, next_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves all FIRs."""
        logger.info("Fetching all FIRs")
        return await self.repo.find_all(limit, next_token)

    async def exists(self, column: str, value: Any) -> bool:
        """Checks if an FIR exists."""
        logger.info(f"Checking if FIR exists where {column}={value}")
        return await self.repo.exists(column, value)

    async def count(self) -> int:
        """Counts all FIRs."""
        logger.info("Counting all FIRs")
        return await self.repo.count()

    async def find_by_number(self, fir_number: str) -> Optional[Dict[str, Any]]:
        """Retrieves an FIR by its unique FIR number."""
        logger.info(f"Fetching FIR by number {fir_number}")
        return await self.repo.find_by_number(fir_number)

    async def find_by_station(self, station_id: str, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves FIRs scoped to a specific police station."""
        logger.info(f"Fetching FIRs for station {station_id}")
        return await self.repo.find_by_station(station_id, limit, offset, sort_by, sort_order)

    async def search(self, search_term: str, station_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Performs a text search on FIR number or description."""
        logger.info(f"Searching FIRs with term: {search_term}")
        return await self.repo.search(search_term, station_id, limit)
