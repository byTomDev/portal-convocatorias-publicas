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
│   └── frontend/    # Aplicación React
├── docker/          # Configuración de Docker
├── docker-compose.yml
├── README.md
└── .env
```
