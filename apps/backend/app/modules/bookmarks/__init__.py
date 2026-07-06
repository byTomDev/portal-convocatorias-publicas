from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.models import Bookmark, Procurement, User
from app.database.session import async_session_maker
from app.modules.auth import get_current_user, get_db
from app.shared.schemas import ProcurementData

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


class CreateBookmarkRequest(BaseModel):
    procurement_data: ProcurementData


class BookmarkResponse(BaseModel):
    id: str
    procurement_id: str
    created_at: str

    class Config:
        from_attributes = True


@router.post("", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    data: CreateBookmarkRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # 1. Buscar procurement por external_process_id; crear si no existe
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
        await db.flush()  # Obtener el ID generado sin cerrar la transacción

    # 2. Verificar si el usuario ya tiene este procurement guardado
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user.id,
            Bookmark.procurement_id == procurement.id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bookmark already exists")

    # 3. Crear la relación user↔procurement
    bookmark = Bookmark(user_id=user.id, procurement_id=procurement.id)
    db.add(bookmark)
    await db.commit()
    await db.refresh(bookmark)

    return BookmarkResponse(
        id=bookmark.id,
        procurement_id=bookmark.procurement_id,
        created_at=bookmark.created_at.isoformat(),
    )


class BookmarkWithProcurementResponse(BaseModel):
    id: str
    procurement_id: str
    created_at: str
    procurement: ProcurementData

    class Config:
        from_attributes = True


@router.get("", response_model=list[BookmarkWithProcurementResponse])
async def list_bookmarks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Bookmark)
        .where(Bookmark.user_id == user.id)
        .options(selectinload(Bookmark.procurement))
    )
    bookmarks = result.scalars().all()

    response = []
    for bm in bookmarks:
        p = bm.procurement
        response.append(
            BookmarkWithProcurementResponse(
                id=bm.id,
                procurement_id=bm.procurement_id,
                created_at=bm.created_at.isoformat(),
                procurement=ProcurementData(
                    id_del_proceso=p.external_process_id,
                    referencia_del_proceso=p.referencia_del_proceso,
                    entidad=p.entidad,
                    nombre_del_procedimiento=p.nombre_del_procedimiento,
                    modalidad_de_contratacion=p.modalidad_de_contratacion,
                    tipo_de_contrato=p.tipo_de_contrato,
                    precio_base=p.precio_base,
                    estado_del_procedimiento=p.estado_del_procedimiento,
                    fase=p.fase,
                    adjudicado=p.adjudicado,
                    fecha_de_publicacion_del=p.fecha_de_publicacion_del,
                    departamento_entidad=p.departamento_entidad,
                    ciudad_entidad=p.ciudad_entidad,
                    url_proceso=p.url_proceso,
                ),
            )
        )
    return response


@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Bookmark).where(
            Bookmark.id == bookmark_id,
            Bookmark.user_id == user.id,
        )
    )
    bookmark = result.scalar_one_or_none()
    if bookmark is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")

    await db.delete(bookmark)
    await db.commit()
