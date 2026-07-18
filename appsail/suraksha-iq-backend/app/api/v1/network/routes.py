from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.api.deps import get_current_officer
from app.repositories.criminal_repo import CriminalRepository
from app.schemas.network import NetworkGraphResponse, Node, Link

router = APIRouter()

@router.get(
    "/offender/{offender_id}",
    response_model=NetworkGraphResponse,
    summary="Get Offender Network Graph",
    description="Retrieves a graph of relationships for a specific offender suitable for D3.js visualization."
)
async def get_offender_network(
    offender_id: str,
    current_user: Dict[str, Any] = Depends(get_current_officer)
):
    """Retrieves offender network from Catalyst Data Store."""
    try:
        repo = CriminalRepository()
        offender = await repo.find_by_id(offender_id)

        if not offender:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offender not found"
            )

        # Build a single-node graph representation from Catalyst data
        nodes = [
            Node(
                id=offender.get("ROWID", offender_id),
                label=offender.get("name", "Unknown"),
                type="Offender",
                properties=offender
            )
        ]
        links = []
        centrality = {offender_id: 1.0}

        return NetworkGraphResponse(
            nodes=nodes,
            links=links,
            centrality_metrics=centrality
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch offender network: {str(e)}"
        )
