from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional

class NetworkNode(BaseModel):
    id: str
    label: str
    type: str  # Offender, Crime, FIR, PoliceStation, District
    properties: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)

class NetworkEdge(BaseModel):
    source: str
    target: str
    type: str  # committed, registered_in, investigated_by, occurred_at, belongs_to
    properties: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)

class NetworkStatistics(BaseModel):
    total_nodes: int
    total_edges: int
    connected_offenders: int
    connected_stations: int
    connected_districts: int
    average_connections: float

    model_config = ConfigDict(from_attributes=True)

class NetworkGraphResponse(BaseModel):
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
    statistics: NetworkStatistics
    metadata: Dict[str, Any] = {}

    model_config = ConfigDict(from_attributes=True)

class NetworkSearchResponse(BaseModel):
    query: str
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]

    model_config = ConfigDict(from_attributes=True)
