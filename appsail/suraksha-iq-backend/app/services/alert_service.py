from typing import List, Dict, Any, Optional
from app.repositories.alert_repo import AlertRepository
from app.core.logger import logger
from app.core.exceptions import DataValidationError, RepositoryError

class AlertService:
    """Service layer for Alert entity."""
    
    def __init__(self, repo: AlertRepository):
        self.repo = repo

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new Alert."""
        logger.info(f"Creating Alert with data: {data}")
        return await self.repo.create(data)

    async def update(self, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Updates an existing Alert."""
        logger.info(f"Updating Alert {id}")
        return await self.repo.update(id, data)

    async def delete(self, id: str) -> bool:
        """Deletes an Alert."""
        logger.info(f"Deleting Alert {id}")
        return await self.repo.delete(id)

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Retrieves an Alert by ID."""
        logger.info(f"Fetching Alert {id}")
        return await self.repo.find_by_id(id)

    async def get_all(self, limit: int = 100, next_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves all Alerts."""
        logger.info("Fetching all Alerts")
        return await self.repo.find_all(limit, next_token)

    async def exists(self, column: str, value: Any) -> bool:
        """Checks if an Alert exists."""
        logger.info(f"Checking if Alert exists where {column}={value}")
        return await self.repo.exists(column, value)

    async def count(self) -> int:
        """Counts all Alerts."""
        logger.info("Counting all Alerts")
        return await self.repo.count()

    async def find_by_district(self, district_id: str, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves alerts scoped to a specific district or statewide."""
        logger.info(f"Fetching Alerts for district {district_id}")
        return await self.repo.find_by_district(district_id, limit, offset, sort_by, sort_order)

    async def find_active(self, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves active alerts with pagination."""
        logger.info("Fetching active Alerts")
        return await self.repo.find_active(limit, offset, sort_by, sort_order)
