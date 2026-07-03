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
    procurement_id: str


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
    result = await db.execute(
        select(Procurement).where(Procurement.id == data.procurement_id)
    )
    procurement = result.scalar_one_or_none()
    if procurement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Procurement not found")

    result = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user.id,
            Bookmark.procurement_id == procurement.id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Bookmark already exists")

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
