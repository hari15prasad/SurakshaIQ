from typing import List, Dict, Any, Optional
from app.repositories.crime_repo import CrimeRepository
from app.core.logger import logger
from app.core.exceptions import DataValidationError, RepositoryError

class CrimeService:
    """Service layer for Crime entity."""
    
    def __init__(self, repo: CrimeRepository):
        self.repo = repo

    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a new Crime."""
        logger.info(f"Creating Crime with data: {data}")
        return await self.repo.create(data)

    async def update(self, id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Updates an existing Crime."""
        logger.info(f"Updating Crime {id}")
        return await self.repo.update(id, data)

    async def delete(self, id: str) -> bool:
        """Deletes a Crime."""
        logger.info(f"Deleting Crime {id}")
        return await self.repo.delete(id)

    async def get_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a Crime by ID."""
        logger.info(f"Fetching Crime {id}")
        return await self.repo.find_by_id(id)

    async def get_all(self, limit: int = 100, next_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves all Crimes."""
        logger.info("Fetching all Crimes")
        return await self.repo.find_all(limit, next_token)

    async def exists(self, column: str, value: Any) -> bool:
        """Checks if a Crime exists."""
        logger.info(f"Checking if Crime exists where {column}={value}")
        return await self.repo.exists(column, value)

    async def count(self) -> int:
        """Counts all Crimes."""
        logger.info("Counting all Crimes")
        return await self.repo.count()

    async def find_by_district(self, district_id: str, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves crimes scoped to a specific district."""
        logger.info(f"Fetching Crimes for district {district_id}")
        return await self.repo.find_by_district(district_id, limit, offset, sort_by, sort_order)

    async def find_by_station(self, station_id: str, limit: int = 100, offset: int = 0, sort_by: str = "CREATEDTIME", sort_order: str = "DESC") -> List[Dict[str, Any]]:
        """Retrieves crimes scoped to a specific police station."""
        logger.info(f"Fetching Crimes for station {station_id}")
        return await self.repo.find_by_station(station_id, limit, offset, sort_by, sort_order)

    async def search(self, search_term: str, district_id: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Performs a text search on crime title, description, or type."""
        logger.info(f"Searching Crimes with term: {search_term}")
        return await self.repo.search(search_term, district_id, limit)
