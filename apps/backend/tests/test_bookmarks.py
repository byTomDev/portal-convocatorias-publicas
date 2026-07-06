import pytest
from unittest.mock import patch


@pytest.mark.asyncio
async def test_create_bookmark_success(client, user_token):
    response = await client.post(
        "/bookmarks",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.2577563",
                "referencia_del_proceso": "EDP-545-2022",
                "entidad": "DANE",
                "nombre_del_procedimiento": "GEIH",
                "modalidad_de_contratacion": "Contratación directa",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "procurement_id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_bookmark_unauthenticated(client):
    response = await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "CO1.REQ.SOME"}},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_bookmark_duplicate(client, user_token):
    payload = {
        "procurement_data": {
            "id_del_proceso": "CO1.REQ.999",
            "entidad": "DANE",
        }
    }

    # First bookmark
    r1 = await client.post(
        "/bookmarks",
        json=payload,
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r1.status_code == 201

    # Duplicate bookmark
    r2 = await client.post(
        "/bookmarks",
        json=payload,
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_list_bookmarks(client, user_token):
    # Create procurement and bookmark in one call
    await client.post(
        "/bookmarks",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.LIST",
                "entidad": "DANE",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )

    response = await client.get(
        "/bookmarks", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_delete_bookmark(client, user_token):
    # Create procurement and bookmark in one call
    create_resp = await client.post(
        "/bookmarks",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.DEL",
                "entidad": "Test",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_resp.status_code == 201
    bookmark_id = create_resp.json()["id"]

    delete_resp = await client.delete(
        f"/bookmarks/{bookmark_id}", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert delete_resp.status_code == 204


@pytest.mark.asyncio
async def test_create_bookmark_reuses_existing_procurement(client, user_token):
    """Same id_del_proceso used by two different users → same procurement, two bookmarks."""
    payload = {
        "procurement_data": {
            "id_del_proceso": "CO1.REQ.REUSE",
            "entidad": "DANE",
            "nombre_del_procedimiento": "Estudio de mercado",
        }
    }

    r1 = await client.post(
        "/bookmarks",
        json=payload,
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r1.status_code == 201
    bookmark1 = r1.json()
    procurement_id = bookmark1["procurement_id"]

    # Same procurement, same user → 409 (duplicate bookmark)
    r2 = await client.post(
        "/bookmarks",
        json=payload,
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r2.status_code == 409

    # Verify the procurement_id returned is the same (procurement was reused)
    assert bookmark1["procurement_id"] == procurement_id
