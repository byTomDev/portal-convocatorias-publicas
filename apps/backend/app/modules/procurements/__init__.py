import httpx
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.models import Procurement
from app.modules.auth import get_current_user, get_db
from app.shared.schemas import ProcurementData

router = APIRouter(prefix="/procurements", tags=["procurements"])


class CreateProcurementRequest(BaseModel):
    procurement_data: ProcurementData


class ProcurementResponse(BaseModel):
    id: str
    external_process_id: str
    created_at: str


@router.post("", response_model=ProcurementResponse, status_code=status.HTTP_201_CREATED)
async def create_procurement(
    data: CreateProcurementRequest,
    _: None = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    external_id = data.procurement_data.id_del_proceso

    result = await db.execute(
        select(Procurement).where(Procurement.external_process_id == external_id)
    )
    procurement = result.scalar_one_or_none()

    if procurement is None:
        procurement = Procurement(
            external_process_id=external_id,
            referencia_del_proceso=data.procurement_data.referencia_del_proceso,
            entidad=data.procurement_data.entidad,
            nombre_del_procedimiento=data.procurement_data.nombre_del_procedimiento,
            modalidad_de_contratacion=data.procurement_data.modalidad_de_contratacion,
            tipo_de_contrato=data.procurement_data.tipo_de_contrato,
            precio_base=data.procurement_data.precio_base,
            estado_del_procedimiento=data.procurement_data.estado_del_procedimiento,
            fase=data.procurement_data.fase,
            adjudicado=data.procurement_data.adjudicado,
            fecha_de_publicacion_del=data.procurement_data.fecha_de_publicacion_del,
            departamento_entidad=data.procurement_data.departamento_entidad,
            ciudad_entidad=data.procurement_data.ciudad_entidad,
            url_proceso=data.procurement_data.url_proceso,
        )
        db.add(procurement)
        await db.commit()
        await db.refresh(procurement)
        status_code = status.HTTP_201_CREATED
    else:
        status_code = status.HTTP_200_OK

    return ProcurementResponse(
        id=procurement.id,
        external_process_id=procurement.external_process_id,
        created_at=procurement.created_at.isoformat(),
    )


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
