from pydantic import BaseModel


class ProcurementData(BaseModel):
    id_del_proceso: str
    referencia_del_proceso: str | None = None
    entidad: str | None = None
    nombre_del_procedimiento: str | None = None
    modalidad_de_contratacion: str | None = None
    tipo_de_contrato: str | None = None
    precio_base: str | None = None
    estado_del_procedimiento: str | None = None
    fase: str | None = None
    adjudicado: str | None = None
    fecha_de_publicacion_del: str | None = None
    departamento_entidad: str | None = None
    ciudad_entidad: str | None = None
    url_proceso: str | None = None
