import pytest


async def register_and_login(client: "AsyncClient", email: str = "me@test.com"):
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    resp = await client.post(
        "/auth/login",
        json={"email": email, "password": "password123"},
    )
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_me_success(client):
    token = await register_and_login(client)
    response = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@test.com"
    assert "id" in data


@pytest.mark.asyncio
async def test_me_no_header(client):
    response = await client.get("/auth/me")
    assert response.status_code == 401
    assert "Missing or invalid authorization header" in response.json()["detail"]


@pytest.mark.asyncio
async def test_me_invalid_token(client):
    response = await client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert response.status_code == 401
    assert "Invalid or expired token" in response.json()["detail"]
