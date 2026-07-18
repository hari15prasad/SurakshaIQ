from fastapi import Depends

# Repositories
from app.repositories.user_repo import UserRepository
from app.repositories.officer_repo import OfficerRepository
from app.repositories.district_repo import DistrictRepository
from app.repositories.police_station_repo import PoliceStationRepository
from app.repositories.crime_repo import CrimeRepository
from app.repositories.fir_repo import FIRRepository
from app.repositories.criminal_repo import CriminalRepository
from app.repositories.alert_repo import AlertRepository
from app.repositories.report_repo import ReportRepository

# Services
from app.services.user_service import UserService
from app.services.officer_service import OfficerService
from app.services.district_service import DistrictService
from app.services.police_station_service import PoliceStationService
from app.services.crime_service import CrimeService
from app.services.fir_service import FIRService
from app.services.criminal_service import CriminalService
from app.services.alert_service import AlertService
from app.services.report_service import ReportService

# Dependency Providers for Repositories
def get_user_repo() -> UserRepository:
    return UserRepository()

def get_officer_repo() -> OfficerRepository:
    return OfficerRepository()

def get_district_repo() -> DistrictRepository:
    return DistrictRepository()

def get_police_station_repo() -> PoliceStationRepository:
    return PoliceStationRepository()

def get_crime_repo() -> CrimeRepository:
    return CrimeRepository()

def get_fir_repo() -> FIRRepository:
    return FIRRepository()

def get_criminal_repo() -> CriminalRepository:
    return CriminalRepository()

def get_alert_repo() -> AlertRepository:
    return AlertRepository()

def get_report_repo() -> ReportRepository:
    return ReportRepository()

# Dependency Providers for Services
def get_user_service(repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(repo)

def get_officer_service(repo: OfficerRepository = Depends(get_officer_repo)) -> OfficerService:
    return OfficerService(repo)

def get_district_service(repo: DistrictRepository = Depends(get_district_repo)) -> DistrictService:
    return DistrictService(repo)

def get_police_station_service(repo: PoliceStationRepository = Depends(get_police_station_repo)) -> PoliceStationService:
    return PoliceStationService(repo)

def get_crime_service(repo: CrimeRepository = Depends(get_crime_repo)) -> CrimeService:
    return CrimeService(repo)

def get_fir_service(repo: FIRRepository = Depends(get_fir_repo)) -> FIRService:
    return FIRService(repo)

def get_criminal_service(repo: CriminalRepository = Depends(get_criminal_repo)) -> CriminalService:
    return CriminalService(repo)

def get_alert_service(repo: AlertRepository = Depends(get_alert_repo)) -> AlertService:
    return AlertService(repo)

def get_report_service(repo: ReportRepository = Depends(get_report_repo)) -> ReportService:
    return ReportService(repo)
