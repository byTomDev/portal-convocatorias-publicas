import pytest
from unittest.mock import patch


@pytest.mark.asyncio
async def test_create_bookmark_success(client, user_token):
    # First create the procurement
    proc_resp = await client.post(
        "/procurements",
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
    assert proc_resp.status_code == 201
    procurement_id = proc_resp.json()["id"]

    # Then create the bookmark
    response = await client.post(
        "/bookmarks",
        json={"procurement_id": procurement_id},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["procurement_id"] == procurement_id
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_bookmark_unauthenticated(client):
    response = await client.post(
        "/bookmarks",
        json={"procurement_id": "some-procurement-id"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_bookmark_procurement_not_found(client, user_token):
    response = await client.post(
        "/bookmarks",
        json={"procurement_id": "non-existent-id"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_bookmark_duplicate(client, user_token):
    # Create procurement first
    proc_resp = await client.post(
        "/procurements",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.999",
                "entidad": "DANE",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert proc_resp.status_code == 201
    procurement_id = proc_resp.json()["id"]

    # First bookmark
    r1 = await client.post(
        "/bookmarks",
        json={"procurement_id": procurement_id},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r1.status_code == 201

    # Duplicate bookmark
    r2 = await client.post(
        "/bookmarks",
        json={"procurement_id": procurement_id},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert r2.status_code == 409


@pytest.mark.asyncio
async def test_list_bookmarks(client, user_token):
    # Create procurement and bookmark first
    proc_resp = await client.post(
        "/procurements",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.LIST",
                "entidad": "DANE",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    procurement_id = proc_resp.json()["id"]

    await client.post(
        "/bookmarks",
        json={"procurement_id": procurement_id},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    response = await client.get(
        "/bookmarks", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_delete_bookmark(client, user_token):
    # Create procurement and bookmark
    proc_resp = await client.post(
        "/procurements",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.DEL",
                "entidad": "Test",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    procurement_id = proc_resp.json()["id"]

    create_resp = await client.post(
        "/bookmarks",
        json={"procurement_id": procurement_id},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert create_resp.status_code == 201
    bookmark_id = create_resp.json()["id"]

    delete_resp = await client.delete(
        f"/bookmarks/{bookmark_id}", headers={"Authorization": f"Bearer {user_token}"}
    )
    assert delete_resp.status_code == 204
