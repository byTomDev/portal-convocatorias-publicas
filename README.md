# Portal de Convocatorias Públicas

Aplicación web para consultar, filtrar y guardar convocatorias públicas colombianas desde datos.gov.co (SECOP II).

## Stack tecnológico

- **Frontend:** React + Vite
- **Backend:** Python + FastAPI
- **Base de datos:** PostgreSQL
- **Contenedores:** Docker + Docker Compose

## Requisitos

- Docker y Docker Compose instalados.

## Configuración

El archivo `.env` contiene las variables de entorno del proyecto. **No se sube al repositorio** por seguridad. Solicítalo al líder del proyecto o responsable técnico y colócalo en la raíz del proyecto.

## Ejecución

```bash
docker compose up --build
```

La aplicación estará disponible en:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API docs:** http://localhost:8000/docs

## Estructura del proyecto

```
portal-convocatorias-publicas/
├── apps/
│   ├── backend/      # API FastAPI
│   │   ├── app/
│   │   │   ├── core/       # Config y seguridad
│   │   │   ├── database/   # Modelos y sesión
│   │   │   ├── modules/    # Dominios (auth, bookmarks, procurements)
│   │   │   └── shared/     # Excepciones compartidas
│   │   └── tests/          # Pruebas de integración
│   └── frontend/    # Aplicación React
├── docker/          # Configuración de Docker
├── docker-compose.yml
├── README.md
└── .env
```

## Pruebas

Las pruebas son de integración con `httpx.AsyncClient` contra la app FastAPI real, usando SQLite en memoria para isolation.

```bash
docker compose exec backend python -m pytest tests/ -v
```

**Cobertura actual:**

| Endpoint | Método | Tests |
|----------|--------|-------|
| `GET /health` | GET | 1 |
| `POST /auth/register` | POST | 5 |
| `POST /auth/login` | POST | 4 |
| `GET /auth/me` | GET | 3 |
| `GET /procurements` | GET | 4 |
| `POST /bookmarks` | POST | 2 |
| `GET /bookmarks` | GET | 1 |
| `DELETE /bookmarks/{id}` | DELETE | 1 |
| **Total** | | **25** |

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

### Favoritos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/bookmarks` | JWT | Listar favoritos del usuario |
| POST | `/bookmarks` | JWT | Guardar favorita (crea/reutiliza procurement + relación) |
| DELETE | `/bookmarks/{id}` | JWT | Eliminar favorita |
