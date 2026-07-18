from typing import List, Dict, Any, Optional
from app.repositories.report_repo import ReportRepository
from app.core.logger import logger
from app.core.exceptions import DataValidationError, RepositoryError

class ReportService:
    """Service layer for Report entity."""
    
    def __init__(self, repo: ReportRepository):
        self.repo = repo

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new Report."""
        logger.info(f"Creating Report with data: {data}")
        return await self.repo.create(data)

    async def update(self, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Updates an existing Report."""
        logger.info(f"Updating Report {id}")
        return await self.repo.update(id, data)

    async def delete(self, id: str) -> bool:
        """Deletes a Report."""
        logger.info(f"Deleting Report {id}")
        return await self.repo.delete(id)

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a Report by ID."""
        logger.info(f"Fetching Report {id}")
        return await self.repo.find_by_id(id)

    async def get_all(self, limit: int = 100, next_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves all Reports."""
        logger.info("Fetching all Reports")
        return await self.repo.find_all(limit, next_token)

    async def exists(self, column: str, value: Any) -> bool:
        """Checks if a Report exists."""
        logger.info(f"Checking if Report exists where {column}={value}")
        return await self.repo.exists(column, value)

    async def count(self) -> int:
        """Counts all Reports."""
        logger.info("Counting all Reports")
        return await self.repo.count()

    async def find_recent(self, limit: int = 10, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves recent reports."""
        logger.info("Fetching recent Reports")
        return await self.repo.find_recent(limit, offset, sort_by, sort_order)

    async def search(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Performs a text search on report name or type."""
        logger.info(f"Searching Reports with term: {search_term}")
        return await self.repo.search(search_term, limit)
