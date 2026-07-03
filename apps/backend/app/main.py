from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.database.models import Base
from app.database.session import engine
from app.modules.auth import router as auth_router
from app.modules.bookmarks import router as bookmarks_router
from app.modules.procurements import router as procurements_router
from app.shared.exceptions import AppException


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Portal Convocatorias Públicas",
    version="0.1.0",
    lifespan=lifespan,
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


app.include_router(auth_router)
app.include_router(bookmarks_router)
app.include_router(procurements_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
