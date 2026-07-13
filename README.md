# Portal de Convocatorias Públicas

Aplicación web para consultar, filtrar y guardar convocatorias públicas colombianas desde datos.gov.co (SECOP II).

## Stack tecnológico

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Base de datos:** PostgreSQL
- **ORM:** SQLAlchemy (async)
- **Autenticación:** JWT + hash de contraseñas
- **API externa:** datos.gov.co / SECOP II (SODA API)
- **Contenedores:** Docker + Docker Compose

## Requisitos

- Docker y Docker Compose instalados.

## Configuración

El proyecto incluye un archivo `.env` de **pruebas** con valores de desarrollo. **No usar en producción.**

```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/convocatorias
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATOS_GOV_API_URL=https://www.datos.gov.co/resource/p6dx-8zbt.json
FRONTEND_URL=http://localhost:5173
```

## Ejecución

```bash
docker compose up --build
```

Este comando buildea y levanta los tres servicios: PostgreSQL, backend (FastAPI) y frontend (React).

La aplicación estará disponible en:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API docs:** http://localhost:8000/docs

## Estructura del proyecto

```
portal-convocatorias-publicas/
├── .agents/                    # Skills y configuración del agente
├── apps/
│   ├── backend/                # API FastAPI
│   │   ├── app/
│   │   │   ├── core/          # Config y seguridad
│   │   │   ├── database/      # Modelos y sesión
│   │   │   ├── modules/       # Dominios (auth, bookmarks, procurements, users)
│   │   │   └── shared/        # Excepciones compartidas
│   │   └── tests/             # Pruebas de integración
│   └── frontend/              # Aplicación React
│       └── src/
│           ├── api/           # Cliente API
│           ├── components/    # Componentes reutilizables
│           ├── context/       # Estado global (AuthContext)
│           ├── pages/         # Vistas (Login, Register, Home, Procurements, Bookmarks, Landing)
│           └── styles/        # Estilos
├── docker/                    # Configuración nginx
├── docs/                      # Documentación del proyecto
├── .env                       # Variables de entorno (pruebas)
├── AGENTS.md                  # Contexto maestro del proyecto
├── AI_FIRST_RESUMEN_TOMAS_JESUS_ESCOBAR_CUELTAN_2026-07-13.md
├── docker-compose.yml
└── README.md
```

## Cómo usar

1. **Registro:** Ve a `/register` y crea una cuenta con correo y contraseña.
2. **Login:** Inicia sesión en `/login` con tus credenciales.
3. **Buscar convocatorias:** En `/procurements` usa los filtros por entidad, fecha y estado para buscar convocatorias. Solicita más resultados con el botón de carga incremental.
4. **Guardar favorita:** Haz clic en guardar junto a cualquier convocatoria para añadirla a tus favoritos.
5. **Ver favoritos:** Accede a `/bookmarks` para listar todas tus convocatorias guardadas.
6. **Eliminar favorita:** Desde `/bookmarks`, elimina las convocatorias que ya no necesites.
7. **Cerrar sesión:** Usa el botón de logout para salir de tu cuenta.

## Endpoints de la API

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Registrar usuario |
| POST | `/auth/login` | No | Iniciar sesión |
| GET | `/auth/me` | JWT | Datos del usuario autenticado |

### Convocatorias

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/procurements` | JWT | Consultar convocatorias desde datos.gov.co con filtros y paginación |

**Parámetros de consulta:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `entity` | string | Búsqueda parcial por nombre de entidad |
| `status` | string | Estado del procedimiento (ej. "Publicado") |
| `start_date` | date | Fecha de publicación inicial (YYYY-MM-DD) |
| `end_date` | date | Fecha de publicación final (YYYY-MM-DD) |
| `limit` | int | Número de resultados por página (máx. 10 en primera consulta) |
| `offset` | int | Desplazamiento para paginación |

### Favoritos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/bookmarks` | JWT | Listar favoritos del usuario |
| POST | `/bookmarks` | JWT | Guardar favorita (crea/reutiliza procurement + relación) |
| DELETE | `/bookmarks/{id}` | JWT | Eliminar favorita |

## Pruebas

Las pruebas son de integración con `httpx.AsyncClient` contra la app FastAPI real, usando SQLite en memoria para isolation.

```bash
docker compose exec backend python -m pytest tests/ -v
```

**Cobertura actual — 32 tests de integración:**

| Endpoint | Método | Tests |
|----------|--------|-------|
| `GET /health` | GET | 1 |
| `POST /auth/register` | POST | 5 |
| `POST /auth/login` | POST | 4 |
| `GET /auth/me` | GET | 3 |
| `GET /procurements` | GET | 7 |
| `POST /bookmarks` | POST | 7 |
| `GET /bookmarks` | GET | 4 |
| `DELETE /bookmarks/{id}` | DELETE | 1 |
| **Total** | | **32** |
