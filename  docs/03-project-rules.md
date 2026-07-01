# Reglas del Proyecto - Portal de Convocatorias Públicas

## 1. Propósito del documento

Este documento define las reglas técnicas que deben seguirse durante el desarrollo del Portal de Convocatorias Públicas.

Estas reglas aplican para cualquier modificación del proyecto, generación de código, refactorización, integración o corrección de errores.

## 2. Stack del proyecto

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

No se debe cambiar el stack tecnológico sin una decisión explícita del equipo.

## 3. Estructura general del repositorio

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
└── .env.example
```

Reglas:

1. El código del backend debe estar en `apps/backend`.
2. El código del frontend debe estar en `apps/frontend`.
3. La documentación del proyecto debe estar en `docs`.
4. La configuración de Docker debe mantenerse en los archivos correspondientes del proyecto.
5. No se deben crear carpetas nuevas en la raíz sin una justificación técnica clara.

## 4. Reglas generales de desarrollo

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

## 5. Reglas para el frontend

El frontend debe estar construido con React + Vite.

Reglas:

1. El frontend debe consumir únicamente la API interna expuesta por FastAPI.
2. El frontend no debe consultar directamente datos.gov.co.
3. El frontend debe manejar autenticación usando el token entregado por el backend.
4. Las rutas privadas deben requerir usuario autenticado.
5. Los usuarios no autenticados deben ser redirigidos al login.
6. El frontend debe enviar parámetros de búsqueda y filtros al backend.
7. La primera consulta de resultados debe solicitar máximo 10 registros.
8. Las solicitudes posteriores deben conservar los filtros aplicados.
9. El frontend debe manejar estados de carga.
10. El frontend debe manejar estados de error.
11. El frontend debe manejar listas vacías.
12. El frontend debe permitir guardar favoritos.
13. El frontend debe permitir listar favoritos.
14. El frontend debe permitir eliminar favoritos.
15. El frontend debe permitir cerrar sesión.

## 6. Estructura del frontend

La estructura inicial del frontend debe seguir este formato:

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

## 7. Reglas para el backend

El backend debe estar construido con Python + FastAPI.

Reglas:

1. El backend debe exponer una API REST.
2. El backend debe concentrar autenticación, reglas de negocio e integración externa.
3. El backend debe validar datos de entrada.
4. El backend debe cifrar contraseñas antes de guardarlas.
5. El backend debe generar JWT al autenticar usuarios.
6. El backend debe validar JWT en rutas privadas.
7. El backend debe consultar datos.gov.co.
8. El backend debe aplicar filtros antes de responder al frontend.
9. El backend debe manejar paginación con `limit` y `offset`.
10. El backend debe transformar la respuesta de datos.gov.co antes de enviarla al frontend.
11. El backend debe manejar errores de conexión con datos.gov.co.
12. El backend debe manejar respuestas vacías.
13. El backend debe gestionar favoritos.
14. El backend debe evitar favoritos duplicados por usuario.
15. El backend debe impedir que un usuario acceda a favoritos de otro usuario.
16. El backend debe comunicarse con PostgreSQL mediante SQLAlchemy o SQLModel.

## 8. Estructura del backend

La estructura inicial del backend debe seguir este formato:

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

## 9. Reglas para módulos del backend

El backend debe organizarse inicialmente en estos módulos:

```txt
auth
users
procurements
bookmarks
```

### auth

Debe manejar:

* Registro.
* Login.
* Hash de contraseñas.
* Generación de JWT.
* Validación de JWT.
* Dependencias de autenticación para rutas privadas.

### users

Debe manejar:

* Modelo de usuario.
* Consulta del usuario autenticado.
* Operaciones internas relacionadas con usuarios.

### procurements

Debe manejar:

* Consulta de convocatorias desde datos.gov.co.
* Aplicación de filtros.
* Paginación con `limit` y `offset`.
* Transformación de respuestas externas.
* Manejo de errores de la API externa.

### bookmarks

Debe manejar:

* Guardar favoritos.
* Listar favoritos del usuario autenticado.
* Eliminar favoritos.
* Evitar favoritos duplicados.
* Validar propiedad del favorito.

## 10. Reglas de autenticación

1. El registro debe solicitar correo, contraseña y confirmación de contraseña.
2. El correo debe tener formato válido.
3. La contraseña y la confirmación deben coincidir.
4. No se deben permitir correos duplicados.
5. Las contraseñas deben almacenarse cifradas.
6. El login debe validar correo y contraseña.
7. El login debe devolver un JWT si las credenciales son correctas.
8. Las rutas privadas deben requerir JWT válido.
9. El backend debe identificar al usuario autenticado desde el token.
10. El frontend no debe acceder a rutas privadas sin token válido.

## 11. Reglas de base de datos

PostgreSQL debe almacenar únicamente datos propios del sistema.

Entidades iniciales:

```txt
users
bookmarks
```

Reglas:

1. La tabla de usuarios debe guardar correo y contraseña cifrada.
2. La tabla de favoritos debe asociar cada favorito a un usuario.
3. Un favorito debe tener una referencia al proceso externo.
4. Un usuario no debe poder duplicar el mismo favorito.
5. Un usuario no debe poder consultar favoritos de otro usuario.
6. Un usuario no debe poder eliminar favoritos de otro usuario.
7. No se deben guardar todas las convocatorias externas en la base de datos.
8. Solo se debe guardar información básica de una convocatoria cuando el usuario la marque como favorita.

## 12. Reglas de integración con datos.gov.co

Endpoint base:

```txt
https://www.datos.gov.co/resource/p6dx-8zbt.json
```

Reglas:

1. La integración con datos.gov.co debe ejecutarse desde el backend.
2. El frontend no debe conocer la estructura interna de datos.gov.co.
3. Toda consulta debe incluir paginación.
4. La primera consulta debe solicitar máximo 10 resultados.
5. Las consultas posteriores deben usar `offset`.
6. Los filtros deben aplicarse desde el backend.
7. Los filtros iniciales soportados son entidad, fecha de publicación y estado del procedimiento.
8. El backend debe manejar errores de conexión.
9. El backend debe manejar respuestas vacías.
10. El backend debe transformar la respuesta externa antes de enviarla al frontend.

Campos relevantes del dataset:

```txt
entidad
id_del_proceso
nombre_del_procedimiento
fecha_de_publicacion_del
estado_del_procedimiento
precio_base
modalidad_de_contratacion
estado_de_apertura_del_proceso
urlproceso
```

## 13. Reglas de búsqueda

1. La búsqueda de convocatorias requiere usuario autenticado.
2. La búsqueda debe consultar datos reales desde datos.gov.co.
3. La primera búsqueda debe solicitar máximo 10 resultados.
4. La búsqueda debe permitir filtros por entidad, fecha y estado.
5. Al cambiar filtros, la búsqueda debe reiniciar desde `offset = 0`.
6. Las solicitudes posteriores deben conservar los filtros aplicados.
7. El backend debe usar `limit` y `offset`.
8. El frontend debe mostrar un estado vacío cuando no haya resultados.
9. El frontend debe mostrar un estado de error cuando falle la consulta.
10. El frontend debe permitir solicitar más resultados.

## 14. Reglas de favoritos

1. Solo usuarios autenticados pueden gestionar favoritos.
2. Cada favorito debe pertenecer a un usuario.
3. El sistema debe evitar favoritos duplicados por usuario.
4. El usuario solo puede listar sus propios favoritos.
5. El usuario solo puede eliminar sus propios favoritos.
6. Los favoritos deben persistirse en PostgreSQL.
7. El favorito debe guardar información básica suficiente para mostrarse sin depender completamente de una nueva consulta externa.

## 15. Reglas de errores

1. Los errores deben ser claros y consistentes.
2. El backend debe devolver códigos HTTP apropiados.
3. El backend no debe exponer detalles sensibles en respuestas de error.
4. El frontend debe mostrar mensajes comprensibles para el usuario.
5. Los errores de validación deben diferenciarse de errores de autenticación.
6. Los errores de datos.gov.co deben manejarse sin romper la aplicación.
7. Las listas vacías no deben tratarse como errores técnicos.

## 16. Reglas de variables de entorno

El proyecto debe incluir `.env.example`.

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
4. El archivo `.env.example` debe mantenerse actualizado cuando se agreguen nuevas variables.

## 17. Reglas de Docker

1. El proyecto debe poder ejecutarse con Docker Compose.
2. Docker Compose debe levantar backend, frontend y PostgreSQL.
3. El backend debe conectarse a PostgreSQL usando variables de entorno.
4. El frontend debe consumir la URL del backend configurada para el entorno.
5. Los Dockerfiles deben mantenerse dentro de cada aplicación o en la ubicación definida por el proyecto.
6. El comando esperado para levantar el proyecto debe ser documentado en el README.

## 18. Reglas de documentación

1. Los documentos del proyecto deben vivir en `docs`.
2. Las decisiones técnicas estables deben documentarse.
3. Los cambios de arquitectura deben reflejarse en `docs/03-architecture.md`.
4. Las reglas técnicas del proyecto deben reflejarse en `docs/04-project-rules.md`.
5. Las reglas específicas de integración con datos.gov.co pueden documentarse en un archivo separado.
6. El README debe explicar cómo ejecutar el proyecto.
7. La documentación debe mantenerse clara, breve y útil para continuar el desarrollo.

## 19. Reglas para agentes de IA

1. Antes de generar código, revisar la documentación existente en `docs`.
2. No cambiar el stack tecnológico.
3. No modificar la arquitectura definida.
4. No agregar funcionalidades fuera del alcance actual.
5. No crear carpetas fuera de la estructura definida sin justificación.
6. No duplicar lógica entre módulos.
7. No mezclar responsabilidades entre frontend y backend.
8. No consultar datos.gov.co desde el frontend.
9. No almacenar todas las convocatorias externas en PostgreSQL.
10. No exponer secretos en código.
11. No reemplazar decisiones documentadas sin actualizar la documentación.
12. Priorizar cambios pequeños, verificables y fáciles de revisar.

## 20. Regla principal

```txt
Mantener el proyecto simple, modular, funcional y alineado con la arquitectura documentada.
```
