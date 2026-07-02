import pytest


@pytest.mark.asyncio
async def test_login_success(client):
    # Register first
    await client.post(
        "/auth/register",
        json={
            "email": "user@example.com",
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    # Then login
    response = await client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/auth/register",
        json={
            "email": "user2@example.com",
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    response = await client.post(
        "/auth/login",
        json={"email": "user2@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_user_not_found(client):
    response = await client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "password123"},
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_invalid_email(client):
    response = await client.post(
        "/auth/login",
        json={"email": "notanemail", "password": "password123"},
    )
    assert response.status_code == 422
