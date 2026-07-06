import httpx
from fastapi import APIRouter, Depends, Query

from app.core.config import settings
from app.modules.auth import get_db

router = APIRouter(prefix="/procurements", tags=["procurements"])


@router.get("")
async def list_procurements(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    entity: str = Query(default=""),
    status: str = Query(default=""),
    start_date: str = Query(default=""),
    end_date: str = Query(default=""),
):
    params = {
        "$limit": limit,
        "$offset": offset,
    }

    filters = []

    if entity:
        filters.append(f"upper(entidad) like '%{entity.upper()}%'")

    if status:
        filters.append(f"estado_del_procedimiento='{status}'")

    if start_date:
        filters.append(f"fecha_de_publicacion_del >= '{start_date}T00:00:00'")

    if end_date:
        filters.append(f"fecha_de_publicacion_del <= '{end_date}T23:59:59'")

    if filters:
        params["$where"] = " AND ".join(filters)

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(settings.DATOS_GOV_API_URL, params=params)

    if response.status_code != 200:
        return []

    return response.json()
