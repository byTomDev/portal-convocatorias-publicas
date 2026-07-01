# Integración API SECOP II - Portal de Convocatorias Públicas

## 1. Propósito

Este documento define cómo el backend del Portal de Convocatorias Públicas debe consumir la API pública de datos.gov.co para consultar procesos de contratación de SECOP II.

La integración debe realizarse únicamente desde el backend FastAPI.

El frontend no debe consultar directamente datos.gov.co.

## 2. Dataset utilizado

Endpoint base:

```http
https://www.datos.gov.co/resource/p6dx-8zbt.json
```

Método:

```http
GET
```

Este dataset permite consultar procesos de contratación pública y aplicar filtros por entidad, fecha de publicación, estado del procedimiento y paginación.

## 3. Responsabilidad del backend

El módulo encargado de esta integración será:

```txt
apps/backend/app/modules/procurements/
```

Responsabilidades del módulo:

* Construir consultas hacia datos.gov.co.
* Aplicar filtros recibidos desde el frontend.
* Enviar parámetros de paginación.
* Manejar errores de conexión.
* Manejar respuestas vacías.
* Transformar la respuesta externa a un formato interno estable.
* Evitar que el frontend dependa de la estructura original del dataset.

## 4. Consulta base

Toda consulta debe incluir paginación.

Consulta inicial:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0
```

Reglas:

* La primera consulta debe solicitar máximo 10 registros.
* Las consultas posteriores deben aumentar el valor de `$offset`.
* El valor de `$limit` debe mantenerse en 10 para la búsqueda inicial del MVP.

## 5. Paginación

Parámetros usados:

```txt
$limit
$offset
```

Ejemplo de primera consulta:

```http
$limit=10&$offset=0
```

Ejemplo de segunda consulta:

```http
$limit=10&$offset=10
```

Ejemplo de tercera consulta:

```http
$limit=10&$offset=20
```

Reglas:

* `$limit` define cuántos registros se solicitan.
* `$offset` define desde qué posición se solicitan los registros.
* Cuando el usuario solicite más resultados, el frontend debe conservar los filtros actuales y enviar el nuevo `offset` al backend.
* El backend debe traducir `limit` y `offset` internos a `$limit` y `$offset` para datos.gov.co.

## 6. Campos recibidos desde datos.gov.co

La consulta inicial a datos.gov.co puede retornar todos los campos disponibles del proceso de contratación. El backend debe recibir la respuesta externa, normalizarla cuando sea necesario y transformar los datos antes de enviarlos al frontend.

Campos recibidos desde el dataset:

```txt
entidad: string
nit_entidad: string
departamento_entidad: string
ciudad_entidad: string
ordenentidad: string
codigo_pci: string
id_del_proceso: string
referencia_del_proceso: string
ppi: string
id_del_portafolio: string
nombre_del_procedimiento: string
descripci_n_del_procedimiento: string
fase: string
fecha_de_publicacion_del: datetime string
fecha_de_ultima_publicaci: datetime string
fecha_de_publicacion_fase_3: datetime string
precio_base: numeric string
modalidad_de_contratacion: string
justificaci_n_modalidad_de: string
duracion: numeric string
unidad_de_duracion: string
ciudad_de_la_unidad_de: string
nombre_de_la_unidad_de: string
proveedores_invitados: numeric string
proveedores_con_invitacion: numeric string
visualizaciones_del: numeric string
proveedores_que_manifestaron: numeric string
respuestas_al_procedimiento: numeric string
respuestas_externas: numeric string
conteo_de_respuestas_a_ofertas: numeric string
proveedores_unicos_con: numeric string
numero_de_lotes: numeric string
estado_del_procedimiento: string
id_estado_del_procedimiento: string
adjudicado: string
id_adjudicacion: string
codigoproveedor: string
departamento_proveedor: string
ciudad_proveedor: string
valor_total_adjudicacion: numeric string
nombre_del_adjudicador: string
nombre_del_proveedor: string
nit_del_proveedor_adjudicado: string
codigo_principal_de_categoria: string
estado_de_apertura_del_proceso: string
tipo_de_contrato: string
subtipo_de_contrato: string
categorias_adicionales: string
urlproceso: object
urlproceso.url: string
codigo_entidad: string
estado_resumen: string
```

Ejemplo de estructura del campo `urlproceso`:

```json
{
  "url": "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9363717"
}
```

Reglas:

* El backend debe asumir que la mayoría de valores llegan como `string`.
* Los campos numéricos pueden llegar como `string` y deben transformarse solo si el caso de uso lo requiere.
* Los campos de fecha llegan como `datetime string` en formato ISO.
* El campo `urlproceso` llega como objeto y la URL debe extraerse desde `urlproceso.url`.
* Si un campo no viene en la respuesta, el backend debe manejarlo como `null` o valor seguro.
* El frontend no debe depender directamente de estos nombres originales del dataset.
* El backend debe definir un formato interno estable para entregar los datos al frontend.

## 7. Formato interno recomendado

El backend debe transformar la respuesta externa a un formato estable antes de enviarla al frontend.

Formato recomendado:

```json
{
  "external_id": "string",
  "entity": "string",
  "procedure_name": "string",
  "publication_date": "string",
  "procedure_status": "string",
  "base_price": "string",
  "contracting_modality": "string",
  "opening_status": "string",
  "process_url": "string"
}
```

Mapeo sugerido:

```txt
id_del_proceso                 → external_id
entidad                        → entity
nombre_del_procedimiento       → procedure_name
fecha_de_publicacion_del       → publication_date
estado_del_procedimiento       → procedure_status
precio_base                    → base_price
modalidad_de_contratacion      → contracting_modality
estado_de_apertura_del_proceso → opening_status
urlproceso                     → process_url
```

Reglas:

* El frontend debe consumir el formato interno definido por el backend.
* El frontend no debe depender de los nombres originales del dataset.
* Si un campo externo no existe en la respuesta, el backend debe devolver `null` o un valor seguro.
* El identificador externo principal debe ser `id_del_proceso`.

## 8. Filtro por entidad

Campo externo:

```txt
entidad
```

Filtro Socrata recomendado:

```sql
upper(entidad) like '%DANE%'
```

Consulta codificada:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0&$where=upper(entidad)%20like%20%27%25DANE%25%27
```

Reglas:

* El filtro por entidad debe permitir búsqueda parcial.
* El filtro por entidad debe ser insensible a mayúsculas y minúsculas.
* El backend debe construir y codificar correctamente la expresión `$where`.
* El valor ingresado por el usuario no debe concatenarse de forma insegura.

## 9. Filtro por fecha de publicación

Campo externo:

```txt
fecha_de_publicacion_del
```

Filtro Socrata recomendado:

```sql
fecha_de_publicacion_del between '2026-01-01T00:00:00' and '2026-12-31T23:59:59'
```

Consulta codificada:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0&$where=fecha_de_publicacion_del%20between%20%272026-01-01T00:00:00%27%20and%20%272026-12-31T23:59:59%27
```

Reglas:

* El backend debe validar el formato de fecha recibido.
* El backend debe construir rangos de fecha válidos.
* Si se recibe una fecha inicial y una fecha final, debe usarse `between`.
* Si no se reciben fechas, no debe aplicarse este filtro.

## 10. Filtro por estado del procedimiento

Campo externo:

```txt
estado_del_procedimiento
```

Consulta directa:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0&estado_del_procedimiento=Publicado
```

Reglas:

* El filtro por estado debe usar valores reales existentes en el dataset.
* El backend debe aplicar el filtro solo si el frontend envía un estado.
* El backend debe evitar valores vacíos o inválidos.

## 11. Consulta de estados disponibles

Consulta para obtener estados existentes:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$select=estado_del_procedimiento,count(*)&$group=estado_del_procedimiento&$order=count(*)%20DESC&$limit=50&$offset=0
```

Uso recomendado:

* Validar valores reales del campo `estado_del_procedimiento`.
* Alimentar una lista de estados en el frontend si se decide implementar un selector.
* Depurar diferencias entre estados esperados y estados reales del dataset.

Esta consulta no es obligatoria para la primera versión si el filtro por estado se maneja como texto o valor simple.

## 12. Combinación de filtros

Para combinar filtros en Socrata se debe usar `AND`.

Ejemplo lógico:

```sql
upper(entidad) like '%DANE%'
AND estado_del_procedimiento = 'Publicado'
AND fecha_de_publicacion_del between '2026-01-01T00:00:00' and '2026-12-31T23:59:59'
```

Consulta codificada:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0&$where=upper(entidad)%20like%20%27%25DANE%25%27%20AND%20estado_del_procedimiento=%27Publicado%27%20AND%20fecha_de_publicacion_del%20between%20%272026-01-01T00:00:00%27%20and%20%272026-12-31T23:59:59%27
```

Reglas:

* Si hay múltiples filtros, deben combinarse con `AND`.
* Si no hay filtros, debe ejecutarse la consulta base paginada.
* El backend debe construir dinámicamente el `$where` solo con filtros presentes.
* El backend debe codificar correctamente la consulta antes de enviarla.
* El backend debe mantener la paginación en todas las combinaciones.

## 13. Codificación URL

Cuando se usa `$where`, los espacios y caracteres especiales deben codificarse.

Referencias:

```txt
espacio = %20
'       = %27
%       = %25
```

Ejemplo no válido para URL directa:

```http
$where=upper(entidad) like '%DANE%'
```

Ejemplo codificado:

```http
$where=upper(entidad)%20like%20%27%25DANE%25%27
```

Reglas:

* El backend debe usar utilidades seguras para construir parámetros de URL.
* No se deben construir URLs finales mediante concatenación insegura de strings.
* Los valores recibidos desde el frontend deben sanitizarse o validarse antes de usarse en `$where`.

## 14. Manejo de respuestas

La API externa devuelve un arreglo JSON.

Reglas:

* Si la respuesta contiene datos, el backend debe transformarlos al formato interno.
* Si la respuesta es un arreglo vacío, el backend debe devolver una lista vacía.
* Una lista vacía no debe tratarse como error técnico.
* Si datos.gov.co no responde, el backend debe devolver un error controlado.
* Si datos.gov.co responde con error, el backend debe devolver un mensaje consistente al frontend.

## 15. Manejo de errores

Errores a contemplar:

* Error de conexión con datos.gov.co.
* Timeout.
* Respuesta inválida.
* Parámetros de filtro inválidos.
* Error al construir la consulta.
* Error inesperado del backend.

Reglas:

* El backend no debe exponer trazas internas al frontend.
* El backend debe usar códigos HTTP apropiados.
* El frontend debe poder diferenciar entre lista vacía y error de consulta.
* El error de la API externa no debe romper la sesión del usuario.

## 16. Relación con favoritos

Cuando el usuario guarde una convocatoria como favorita, el backend debe persistir información básica del proceso.

Campos recomendados para favoritos:

```txt
external_id
entity
procedure_name
publication_date
procedure_status
base_price
contracting_modality
opening_status
process_url
```

Reglas:

* `external_id` debe mapearse desde `id_del_proceso`.
* El favorito debe asociarse al usuario autenticado.
* Un usuario no debe poder guardar dos veces el mismo `external_id`.
* Los favoritos deben poder mostrarse aunque la API externa no esté disponible temporalmente.
* No se debe guardar una copia completa del dataset externo.

## 17. Parámetros internos del endpoint del backend

El endpoint interno del backend para búsqueda puede aceptar parámetros como:

```txt
entity
status
start_date
end_date
limit
offset
```

Estos nombres internos deben ser independientes de los nombres originales del dataset.

Ejemplo conceptual:

```http
GET /procurements?entity=DANE&status=Publicado&start_date=2026-01-01&end_date=2026-12-31&limit=10&offset=0
```

Reglas:

* El backend traduce parámetros internos a filtros Socrata.
* El frontend consume únicamente el endpoint interno.
* El frontend no debe construir consultas Socrata.
* El backend define el contrato estable de datos hacia el frontend.

## 18. Reglas principales de integración

1. La integración con datos.gov.co vive en el backend.
2. El frontend no consulta directamente datos.gov.co.
3. Toda consulta externa debe usar paginación.
4. La primera consulta debe solicitar máximo 10 resultados.
5. Las búsquedas posteriores deben conservar filtros y modificar `offset`.
6. Los filtros soportados son entidad, fecha de publicación y estado del procedimiento.
7. Los filtros combinados deben usar `AND`.
8. El backend debe transformar la respuesta externa.
9. El frontend debe consumir el formato interno del backend.
10. Los favoritos deben guardar información básica del proceso.
11. La API externa no debe ser una dependencia directa para mostrar favoritos ya guardados.
12. Las respuestas vacías no son errores técnicos.
13. Los errores de datos.gov.co deben manejarse de forma controlada.
