import pytest


@pytest.mark.asyncio
async def test_register_success(client):
    payload = {
        "email": "test@example.com",
        "password": "password123",
        "confirm_password": "password123",
    }
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "password123",
        "confirm_password": "password123",
    }
    await client.post("/auth/register", json=payload)
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 409
    assert "Email already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_register_password_mismatch(client):
    payload = {
        "email": "mismatch@example.com",
        "password": "password123",
        "confirm_password": "different",
    }
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_password_too_short(client):
    payload = {
        "email": "short@example.com",
        "password": "short",
        "confirm_password": "short",
    }
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(client):
    payload = {
        "email": "notanemail",
        "password": "password123",
        "confirm_password": "password123",
    }
    response = await client.post("/auth/register", json=payload)
    assert response.status_code == 422
