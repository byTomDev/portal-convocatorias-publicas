# Contexto Maestro del Proyecto

## Portal de Convocatorias Públicas

## 1. Propósito del documento

Este documento consolida el contexto principal del proyecto **Portal de Convocatorias Públicas**. Su objetivo es servir como referencia central para comprender el alcance funcional, la arquitectura, las reglas técnicas, la integración con datos.gov.co y los criterios de desarrollo del sistema.

Toda modificación, implementación, refactorización o decisión técnica debe mantenerse alineada con este documento y con la documentación fuente ubicada en `docs/`.

---

## 2. Descripción general del producto

El **Portal de Convocatorias Públicas** es una aplicación web que permite a usuarios registrados consultar, filtrar y guardar convocatorias públicas colombianas obtenidas desde datos.gov.co, específicamente desde información relacionada con procesos de contratación pública SECOP II.

El sistema permite:

- Registro de usuarios.
- Inicio de sesión.
- Acceso a una zona privada.
- Consulta de convocatorias públicas reales.
- Filtros básicos de búsqueda.
- Visualización de resultados paginados.
- Gestión de favoritos persistidos en base de datos.

---

## 3. Alcance funcional del MVP

El alcance actual del MVP incluye:

- Registro simple con correo, contraseña y confirmación de contraseña.
- Inicio de sesión con correo y contraseña.
- Autenticación mediante JWT.
- Protección de rutas privadas.
- Página inicial privada para usuarios autenticados.
- Consulta de convocatorias desde datos.gov.co.
- Filtro por entidad.
- Filtro por fecha de publicación.
- Filtro por estado del procedimiento.
- Primera consulta de máximo 10 resultados.
- Solicitud de más resultados conservando filtros aplicados.
- Guardado de convocatorias como favoritas.
- Listado de favoritos del usuario autenticado.
- Eliminación de favoritos.
- Persistencia de usuarios y favoritos en PostgreSQL.
- Ejecución del proyecto mediante Docker Compose.

---

## 4. Funcionalidades fuera del alcance actual

Las siguientes funcionalidades no hacen parte del MVP actual:

- Confirmación de correo electrónico.
- Recuperación de contraseña.
- Completar perfil de usuario.
- Roles de administrador.
- Dashboard avanzado.
- Notificaciones.
- Envío de correos.
- Exportación de resultados.
- Recomendaciones personalizadas.
- Búsquedas guardadas.
- Persistencia completa de convocatorias externas.
- Indexación propia del dataset externo.

Estas funcionalidades solo deben implementarse si existe una decisión explícita y documentada que actualice el alcance del proyecto.

---

## 5. Stack tecnológico definido

El stack definido para el proyecto es:

```txt
Frontend: React + Vite
Backend: Python + FastAPI
Base de datos: PostgreSQL
ORM: SQLAlchemy o SQLModel
Autenticación: JWT + hash de contraseñas
API externa: datos.gov.co / SODA API
Contenedores: Docker + Docker Compose
```

No se debe cambiar el stack tecnológico sin una decisión explícita y documentada.

---

## 6. Arquitectura general

La arquitectura inicial separa claramente las responsabilidades del sistema:

```txt
Usuario
   ↓
Frontend React + Vite
   ↓
Backend FastAPI
   ↓
PostgreSQL

Backend FastAPI
   ↓
datos.gov.co / SECOP II
```

Responsabilidades principales:

```txt
Frontend: interfaz, navegación, estado de sesión y consumo de API interna.
Backend: autenticación, reglas de negocio, integración externa y acceso a datos.
PostgreSQL: persistencia de usuarios y favoritos.
datos.gov.co: fuente externa de convocatorias públicas.
```

Regla fundamental:

```txt
El frontend no consulta directamente datos.gov.co.
```

Toda integración con datos.gov.co debe pasar por el backend.

---

## 7. Estructura general del repositorio

La estructura base del proyecto es:

```txt
portal-convocatorias-publicas/
├── apps/
│   ├── backend/
│   └── frontend/
├── docs/
├── docker/
├── docker-compose.yml
├── README.md
└── .env
```

Reglas:

1. El código del backend debe estar en `apps/backend`.
2. El código del frontend debe estar en `apps/frontend`.
3. La documentación del proyecto debe estar en `docs`.
4. La configuración de Docker debe mantenerse en los archivos correspondientes del proyecto.
5. No se deben crear carpetas nuevas en la raíz sin una justificación técnica clara.

---

## 8. Estructura del frontend

El frontend debe estar construido con React + Vite y seguir esta estructura inicial:

```txt
apps/frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── hooks/
│   ├── context/
│   └── main.jsx
├── package.json
└── Dockerfile
```

Responsabilidades por carpeta:

```txt
api: comunicación con el backend.
components: componentes reutilizables.
pages: vistas principales.
routes: configuración de rutas.
hooks: lógica reutilizable de React.
context: estado global necesario.
```

Reglas del frontend:

1. Consumir únicamente la API interna expuesta por FastAPI.
2. No consultar directamente datos.gov.co.
3. Gestionar autenticación usando el token entregado por el backend.
4. Proteger rutas privadas.
5. Redirigir usuarios no autenticados al login.
6. Enviar parámetros de búsqueda y filtros al backend.
7. Solicitar máximo 10 registros en la primera consulta.
8. Conservar filtros aplicados en solicitudes posteriores.
9. Manejar estados de carga, error y listas vacías.
10. Permitir guardar, listar y eliminar favoritos.
11. Permitir cerrar sesión.

---

## 9. Estructura del backend

El backend debe estar construido con Python + FastAPI y exponer una API REST.

Estructura inicial:

```txt
apps/backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── database/
│   │   ├── session.py
│   │   └── models.py
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── procurements/
│   │   └── bookmarks/
│   └── shared/
│       └── exceptions.py
├── requirements.txt
└── Dockerfile
```

Responsabilidades por carpeta:

```txt
core: configuración general y seguridad.
database: conexión, sesión y modelos de base de datos.
modules: dominios funcionales del sistema.
shared: utilidades compartidas y manejo común de errores.
```

Módulos iniciales:

```txt
auth
procurements
bookmarks
```

Responsabilidades por módulo:

- `auth`: registro, login, hash de contraseñas, generación y validación de JWT, protección de rutas privadas, `/auth/me`.
- `procurements`: consulta de convocatorias desde datos.gov.co, filtros, paginación, transformación de respuestas y manejo de errores externos. Requiere JWT.
- `bookmarks`: guardar, listar y eliminar favoritos, evitar duplicados y validar propiedad del favorito.

---

## 10. Reglas de autenticación

1. El registro solicita correo, contraseña y confirmación de contraseña.
2. El backend valida el formato del correo.
3. El backend valida que la contraseña y la confirmación coincidan.
4. No se permiten correos duplicados.
5. Las contraseñas se almacenan cifradas.
6. El login valida correo y contraseña.
7. El login genera un JWT cuando las credenciales son correctas.
8. El token JWT expira en 30 minutos por defecto (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
9. Las rutas privadas requieren JWT válido.
10. El backend identifica al usuario autenticado desde el token.
11. El frontend no accede a rutas privadas sin token válido.

---

## 11. Reglas de base de datos

PostgreSQL debe almacenar únicamente datos propios del sistema.

Entidades:

```txt
users
procurements
bookmarks
```

Datos de usuarios:

- Identificador único.
- Correo electrónico.
- Contraseña cifrada.
- Fecha de creación.
- Fecha de actualización, si aplica.

Datos de favoritos:

- Identificador único.
- Identificador del usuario propietario.
- Identificador o referencia del proceso externo (apunta a `procurements`).
- Entidad.
- Nombre del procedimiento.
- Fecha de publicación.
- Estado del procedimiento.
- Precio base, si existe.
- Modalidad de contratación, si existe.
- URL del proceso, si existe.
- Fecha de creación.

Reglas:

1. No se deben almacenar todas las convocatorias externas.
2. Solo se guarda información básica cuando una convocatoria se marca como favorita.
3. Cada favorito pertenece a un usuario autenticado.
4. Un usuario no puede duplicar el mismo favorito (mismo `external_process_id`).
5. Un usuario no puede consultar favoritos de otro usuario.
6. Un usuario no puede eliminar favoritos de otro usuario.
7. `procurements` es una tabla propia; se crea o reutiliza desde `POST /bookmarks`.
8. `bookmarks` es la relación `user ↔ procurement`; no duplica campos del proceso.

---

## 12. Integración con datos.gov.co / SECOP II

La fuente externa principal es datos.gov.co.

Endpoint base:

```http
https://www.datos.gov.co/resource/p6dx-8zbt.json
```

Método:

```http
GET
```

La integración debe implementarse únicamente desde el backend, dentro del módulo:

```txt
apps/backend/app/modules/procurements/
```

Responsabilidades del módulo:

- Construir consultas hacia datos.gov.co.
- Aplicar filtros recibidos desde el frontend.
- Enviar parámetros de paginación.
- Manejar errores de conexión.
- Manejar respuestas vacías.
- Transformar la respuesta externa a un formato interno estable.
- Evitar que el frontend dependa de la estructura original del dataset.

---

## 13. Paginación de convocatorias

Toda consulta debe incluir paginación.

Consulta inicial:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0
```

Parámetros usados:

```txt
$limit
$offset
```

Ejemplos:

```txt
Primera consulta: $limit=10&$offset=0
Segunda consulta: $limit=10&$offset=10
Tercera consulta: $limit=10&$offset=20
```

Reglas:

1. La primera consulta debe solicitar máximo 10 registros.
2. Las consultas posteriores deben aumentar el valor de `$offset`.
3. El backend traduce `limit` y `offset` internos a `$limit` y `$offset` para datos.gov.co.
4. Cuando el usuario solicite más resultados, el frontend debe conservar los filtros actuales y enviar el nuevo `offset` al backend.
5. Si no hay más resultados, el frontend debe mostrar un estado claro o deshabilitar la acción correspondiente.

---

## 14. Formato interno de convocatorias

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

1. El identificador externo principal debe ser `id_del_proceso`.
2. El campo `urlproceso` llega como objeto y la URL debe extraerse desde `urlproceso.url`.
3. Si un campo externo no existe en la respuesta, el backend debe devolver `null` o un valor seguro.
4. El frontend no debe depender de los nombres originales del dataset.
5. La mayoría de valores externos pueden llegar como `string`.
6. Los campos numéricos deben transformarse solo si el caso de uso lo requiere.
7. Los campos de fecha llegan como cadenas datetime en formato ISO.

---

## 15. Filtros soportados

Los filtros iniciales soportados son:

```txt
entidad
fecha_de_publicacion_del
estado_del_procedimiento
```

Parámetros internos sugeridos para el endpoint del backend:

```txt
entity
status
start_date
end_date
limit
offset
```

Ejemplo conceptual:

```http
GET /procurements?entity=DANE&status=Publicado&start_date=2026-01-01&end_date=2026-12-31&limit=10&offset=0
```

Reglas:

1. El frontend consume únicamente el endpoint interno.
2. El frontend no construye consultas Socrata.
3. El backend traduce parámetros internos a filtros Socrata.
4. Al cambiar filtros, la búsqueda reinicia desde `offset = 0`.
5. Si no hay filtros, se ejecuta la consulta base paginada.
6. Si hay múltiples filtros, se combinan con `AND`.

---

## 16. Filtro por entidad

Campo externo:

```txt
entidad
```

Filtro Socrata recomendado:

```sql
upper(entidad) like '%DANE%'
```

Reglas:

1. Debe permitir búsqueda parcial.
2. Debe ser insensible a mayúsculas y minúsculas.
3. El backend debe construir y codificar correctamente la expresión `$where`.
4. El valor ingresado por el usuario no debe concatenarse de forma insegura.

---

## 17. Filtro por fecha de publicación

Campo externo:

```txt
fecha_de_publicacion_del
```

Filtro Socrata recomendado:

```sql
fecha_de_publicacion_del between '2026-01-01T00:00:00' and '2026-12-31T23:59:59'
```

Reglas:

1. El backend debe validar el formato de fecha recibido.
2. El backend debe construir rangos de fecha válidos.
3. Si se recibe fecha inicial y fecha final, debe usarse `between`.
4. Si no se reciben fechas, no debe aplicarse este filtro.

---

## 18. Filtro por estado del procedimiento

Campo externo:

```txt
estado_del_procedimiento
```

Consulta directa:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$limit=10&$offset=0&estado_del_procedimiento=Publicado
```

Reglas:

1. El filtro debe usar valores reales existentes en el dataset.
2. El backend debe aplicar el filtro solo si el frontend envía un estado.
3. El backend debe evitar valores vacíos o inválidos.

Consulta recomendada para validar estados disponibles:

```http
GET https://www.datos.gov.co/resource/p6dx-8zbt.json?$select=estado_del_procedimiento,count(*)&$group=estado_del_procedimiento&$order=count(*)%20DESC&$limit=50&$offset=0
```

---

## 19. Combinación y codificación de filtros

Para combinar filtros en Socrata se debe usar `AND`.

Ejemplo lógico:

```sql
upper(entidad) like '%DANE%'
AND estado_del_procedimiento = 'Publicado'
AND fecha_de_publicacion_del between '2026-01-01T00:00:00' and '2026-12-31T23:59:59'
```

Codificación URL relevante:

```txt
espacio = %20
'       = %27
%       = %25
```

Reglas:

1. El backend debe construir dinámicamente el `$where` solo con filtros presentes.
2. El backend debe codificar correctamente la consulta antes de enviarla.
3. El backend debe mantener la paginación en todas las combinaciones.
4. El backend debe usar utilidades seguras para construir parámetros de URL.
5. No se deben construir URLs finales mediante concatenación insegura de strings.
6. Los valores recibidos desde el frontend deben validarse o sanitizarse antes de usarse en `$where`.

---

## 20. Manejo de respuestas y errores externos

La API externa devuelve un arreglo JSON.

Reglas:

1. Si la respuesta contiene datos, el backend debe transformarlos al formato interno.
2. Si la respuesta es un arreglo vacío, el backend debe devolver una lista vacía.
3. Una lista vacía no debe tratarse como error técnico.
4. Si datos.gov.co no responde o responde con error (código distinto de 200), el backend devuelve HTTP 502 y el frontend muestra mensaje amigable.
5. Si datos.gov.co responde con error, el backend debe devolver un mensaje consistente al frontend.
6. El backend no debe exponer trazas internas al frontend.
7. El backend debe usar códigos HTTP apropiados.
8. El frontend debe diferenciar entre lista vacía y error de consulta.
9. El error de la API externa no debe romper la sesión del usuario.

Errores a contemplar:

- Error de conexión con datos.gov.co.
- Timeout.
- Respuesta inválida.
- Parámetros de filtro inválidos.
- Error al construir la consulta.
- Error inesperado del backend.

---

## 21. Reglas de favoritos

Los favoritos permiten al usuario guardar convocatorias para revisarlas posteriormente.

Flujo: `POST /bookmarks` recibe `procurement_data` con los datos de la convocatoria, crea o reutiliza el registro en `procurements` (por `id_del_proceso`), y luego crea la relación `bookmark` con el usuario autenticado — todo en una operación atómica.

Campos del procurement (persistidos via `procurement_data` en `POST /bookmarks`):

```txt
id_del_proceso                 → external_process_id
referencia_del_proceso
entidad
nombre_del_procedimiento
modalidad_de_contratacion
tipo_de_contrato
precio_base
estado_del_procedimiento
fase
adjudicado
fecha_de_publicacion_del
departamento_entidad
ciudad_entidad
url_proceso
```

Reglas:

1. Solo usuarios autenticados pueden gestionar favoritos.
2. El backend debe validar el JWT.
3. El backend debe identificar al usuario autenticado.
4. El favorito debe asociarse al usuario autenticado.
5. Un usuario no debe poder guardar dos veces el mismo `external_id`.
6. Los favoritos deben persistirse en PostgreSQL.
7. El usuario solo puede listar sus propios favoritos.
8. El usuario solo puede eliminar sus propios favoritos.
9. Los favoritos deben poder mostrarse aunque la API externa no esté disponible temporalmente.
10. No se debe guardar una copia completa del dataset externo.

---

## 22. Historias de usuario del MVP

### HU-01: Registro simple

Como visitante, quiero registrarme con correo electrónico, contraseña y confirmación de contraseña, para crear una cuenta en el portal.

Criterios principales:

- Solicitar correo, contraseña y confirmación.
- Validar formato de correo.
- Validar coincidencia de contraseña y confirmación.
- Rechazar correos duplicados.
- Almacenar contraseña cifrada.
- Mostrar errores claros.

### HU-02: Inicio de sesión

Como usuario registrado, quiero iniciar sesión con correo y contraseña, para acceder a mi cuenta.

Criterios principales:

- Validar credenciales.
- Rechazar credenciales inválidas.
- Generar JWT si las credenciales son correctas.
- Gestionar el token desde el frontend.
- Mostrar errores claros.

### HU-03: Inicio privado

Como usuario autenticado, quiero acceder a una página principal privada, para usar las funcionalidades del portal.

Criterios principales:

- Requerir autenticación.
- Redirigir usuarios no autenticados al login.
- Permitir navegación a búsqueda y favoritos.
- Permitir cierre de sesión.

### HU-04: Buscar convocatorias públicas

Como usuario autenticado, quiero consultar convocatorias públicas desde datos.gov.co, para encontrar oportunidades relevantes.

Criterios principales:

- Requerir usuario autenticado.
- Consultar desde backend.
- Usar datos reales de la API pública.
- Solicitar máximo 10 resultados en la primera consulta.
- Transformar respuesta externa antes de enviarla al frontend.
- Manejar respuestas vacías y errores externos.

### HU-05: Filtrar convocatorias

Como usuario autenticado, quiero filtrar convocatorias por entidad, fecha y estado, para encontrar resultados más precisos.

Criterios principales:

- Permitir filtros por entidad, fecha y estado.
- Enviar filtros al backend.
- Reiniciar búsqueda desde `offset = 0` al cambiar filtros.
- Manejar estados vacíos y errores.

### HU-06: Solicitar más resultados

Como usuario autenticado, quiero solicitar más resultados de búsqueda, para continuar explorando convocatorias sin perder los filtros aplicados.

Criterios principales:

- Conservar filtros actuales.
- Usar `limit` y `offset`.
- Consultar datos.gov.co con el nuevo `offset`.
- Mostrar nuevos resultados o estado de no más resultados.

### HU-07: Guardar convocatoria como favorita

Como usuario autenticado, quiero guardar una convocatoria como favorita, para revisarla más tarde.

Criterios principales:

- Requerir autenticación.
- Validar JWT.
- Asociar favorito al usuario autenticado.
- Evitar favoritos duplicados.
- Persistir en PostgreSQL.
- Guardar información básica suficiente.

### HU-08: Ver favoritos

Como usuario autenticado, quiero ver mis convocatorias favoritas, para hacer seguimiento a oportunidades guardadas.

Criterios principales:

- Requerir autenticación.
- Listar únicamente favoritos del usuario autenticado.
- Mostrar estado vacío cuando no existan favoritos.
- Impedir acceso a favoritos de otros usuarios.

### HU-09: Eliminar favorito

Como usuario autenticado, quiero eliminar una convocatoria de mis favoritos, para mantener actualizada mi lista.

Criterios principales:

- Requerir autenticación.
- Validar JWT.
- Verificar propiedad del favorito.
- Eliminar de PostgreSQL.
- Actualizar la lista en frontend.
- Manejar errores de eliminación.

---

## 23. Variables de entorno

El proyecto debe incluir un archivo `.env`.

Variables iniciales:

```txt
DATABASE_URL=
JWT_SECRET=
JWT_ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
DATOS_GOV_API_URL=
FRONTEND_URL=
```

Reglas:

1. El archivo `.env` real no debe subirse al repositorio.
2. Los secretos no deben escribirse directamente en el código.
3. Las variables de entorno deben cargarse desde la configuración del backend o del entorno Docker.
4. El archivo `.env` debe mantenerse actualizado cuando se agreguen nuevas variables.

---

## 24. Docker y ejecución del proyecto

Reglas:

1. El proyecto debe poder ejecutarse con Docker Compose.
2. Docker Compose debe levantar backend, frontend y PostgreSQL.
3. El backend debe conectarse a PostgreSQL usando variables de entorno.
4. El frontend debe consumir la URL del backend configurada para el entorno.
5. Los Dockerfiles deben mantenerse dentro de cada aplicación o en la ubicación definida por el proyecto.
6. El comando esperado para levantar el proyecto debe estar documentado en el README.

---

## 25. Reglas generales de desarrollo

1. Mantener el código simple, legible y modular.
2. Separar responsabilidades por dominio.
3. Evitar duplicación innecesaria de lógica.
4. No implementar funcionalidades fuera del alcance definido.
5. No introducir dependencias nuevas sin justificación.
6. No modificar decisiones de arquitectura sin actualizar la documentación correspondiente.
7. No mezclar lógica de frontend, backend, base de datos e integración externa.
8. Mantener nombres de archivos, carpetas, funciones y variables claros y consistentes.
9. Priorizar soluciones pequeñas, verificables y fáciles de revisar.
10. Antes de modificar una parte del sistema, revisar los documentos existentes en `docs`.

---

## 26. Reglas de documentación

1. Los documentos del proyecto deben vivir en `docs`.
2. Las decisiones técnicas estables deben documentarse.
3. Los cambios de arquitectura deben reflejarse en la documentación de arquitectura.
4. Las reglas técnicas del proyecto deben reflejarse en la documentación de reglas del proyecto.
5. Las reglas específicas de integración con datos.gov.co deben documentarse en un archivo separado cuando sea necesario.
6. El README debe explicar cómo ejecutar el proyecto.
7. La documentación debe mantenerse clara, breve y útil para continuar el desarrollo.

Cuando se agreguen nuevas historias de usuario:

- Cada nueva historia debe tener un identificador único.
- Cada nueva historia debe tener criterios de aceptación.
- Si una historia cambia arquitectura, debe actualizarse la documentación de arquitectura.
- Si una historia cambia reglas técnicas, debe actualizarse la documentación de reglas del proyecto.
- Si una historia afecta la integración con datos.gov.co, debe actualizarse la documentación de integración correspondiente.

Formato recomendado:

```md
## HU-XX: Nombre de la historia

Como [tipo de usuario], quiero [acción o funcionalidad], para [beneficio o propósito].

### Criterios de aceptación

- Criterio 1.
- Criterio 2.
- Criterio 3.
```

---

## 27. Criterios de finalización del MVP

El alcance actual se considera funcional cuando:

- Un visitante puede registrarse.
- Un usuario registrado puede iniciar sesión.
- Un usuario autenticado puede acceder a una zona privada.
- Un usuario autenticado puede consultar convocatorias reales desde datos.gov.co.
- Un usuario autenticado puede aplicar filtros básicos.
- Un usuario autenticado puede solicitar más resultados.
- Un usuario autenticado puede guardar convocatorias como favoritas.
- Un usuario autenticado puede listar sus favoritos.
- Un usuario autenticado puede eliminar favoritos.
- Los favoritos persisten en PostgreSQL.
- El frontend no consulta directamente datos.gov.co.
- El proyecto puede ejecutarse con Docker Compose.

---

## 28. Principios rectores del proyecto

```txt
Mantener el proyecto simple, modular, funcional y alineado con la arquitectura documentada.
```

Principios complementarios:

1. El backend concentra autenticación, reglas de negocio e integración externa.
2. El frontend se limita a interfaz, navegación, estado de sesión y consumo de API interna.
3. La base de datos almacena datos propios del sistema, no una copia completa de datos.gov.co.
4. La API externa debe estar desacoplada del frontend mediante un formato interno estable.
5. Las funcionalidades futuras deben documentarse antes de implementarse.
6. Cada cambio debe ser pequeño, claro, verificable y consistente con el MVP.
