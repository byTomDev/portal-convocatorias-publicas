from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), nullable=True
    )

    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid4()))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    procurement_id: Mapped[str] = mapped_column(ForeignKey("procurements.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("user_id", "procurement_id", name="uq_bookmark_user_procurement"),)

    user: Mapped["User"] = relationship(back_populates="bookmarks")
    procurement: Mapped["Procurement"] = relationship(back_populates="bookmarks")


class Procurement(Base):
    __tablename__ = "procurements"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: str(uuid4()))
    external_process_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    referencia_del_proceso: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entidad: Mapped[str | None] = mapped_column(String(500), nullable=True)
    nombre_del_procedimiento: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    modalidad_de_contratacion: Mapped[str | None] = mapped_column(String(200), nullable=True)
    tipo_de_contrato: Mapped[str | None] = mapped_column(String(200), nullable=True)
    precio_base: Mapped[str | None] = mapped_column(String(50), nullable=True)
    estado_del_procedimiento: Mapped[str | None] = mapped_column(String(100), nullable=True)
    fase: Mapped[str | None] = mapped_column(String(100), nullable=True)
    adjudicado: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fecha_de_publicacion_del: Mapped[str | None] = mapped_column(String(50), nullable=True)
    departamento_entidad: Mapped[str | None] = mapped_column(String(100), nullable=True)
    ciudad_entidad: Mapped[str | None] = mapped_column(String(100), nullable=True)
    url_proceso: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="procurement", cascade="all, delete-orphan")
