import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.database.models import Base
from app.main import app
from app.modules.auth import get_db as auth_get_db, hash_password
from app.database.models import User

# Per-test in-memory SQLite engine + session maker
_test_engine = None
_TestSessionMaker = None


async def _get_db_override():
    global _TestSessionMaker
    async with _TestSessionMaker() as session:
        yield session


@pytest.fixture(autouse=True)
async def setup_db():
    global _test_engine, _TestSessionMaker
    # Create engine in the current event loop (safe for pytest-asyncio)
    _test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    _TestSessionMaker = async_sessionmaker(bind=_test_engine, class_=AsyncSession, expire_on_commit=False)

    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    if _test_engine is not None:
        await _test_engine.dispose()
    _test_engine = None
    _TestSessionMaker = None


@pytest.fixture
async def client():
    app.dependency_overrides[auth_get_db] = _get_db_override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def user_token(client):
    await client.post(
        "/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    login_resp = await client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )
    return login_resp.json()["access_token"]
