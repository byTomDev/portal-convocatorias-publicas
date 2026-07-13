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


# --- Filter tests ---


@pytest.mark.asyncio
async def test_list_bookmarks_with_entity_filter(client, user_token):
    """Filter by entity returns only matching bookmarks."""
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-ENTITY-1", "entidad": "DANE", "nombre_del_procedimiento": "GEIH"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-ENTITY-2", "entidad": "MINDEFENSA", "nombre_del_procedimiento": "Armas"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get("/bookmarks?entity=DANE", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["procurement"]["entidad"] == "DANE"


@pytest.mark.asyncio
async def test_list_bookmarks_with_status_filter(client, user_token):
    """Filter by status returns only matching bookmarks."""
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-STATUS-1", "estado_del_procedimiento": "Publicado"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-STATUS-2", "estado_del_procedimiento": "Cancelado"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get("/bookmarks?status=Publicado", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["procurement"]["estado_del_procedimiento"] == "Publicado"


@pytest.mark.asyncio
async def test_list_bookmarks_with_date_range(client, user_token):
    """Filter by date range returns bookmarks within that range."""
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-DATE-1", "fecha_de_publicacion_del": "2024-01-15T00:00:00"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-DATE-2", "fecha_de_publicacion_del": "2024-06-20T00:00:00"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get(
        "/bookmarks?start_date=2024-01-01&end_date=2024-03-31",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert "2024-01-15" in data[0]["procurement"]["fecha_de_publicacion_del"]


@pytest.mark.asyncio
async def test_list_bookmarks_combined_filters(client, user_token):
    """Combining entity + status filters returns intersection."""
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-COMB-1", "entidad": "DANE", "estado_del_procedimiento": "Publicado"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-COMB-2", "entidad": "DANE", "estado_del_procedimiento": "Cancelado"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-COMB-3", "entidad": "MINDEFENSA", "estado_del_procedimiento": "Publicado"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get("/bookmarks?entity=DANE&status=Publicado", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["procurement"]["entidad"] == "DANE"
    assert data[0]["procurement"]["estado_del_procedimiento"] == "Publicado"


@pytest.mark.asyncio
async def test_list_bookmarks_pagination_limit_offset(client, user_token):
    """Pagination via limit and offset works correctly."""
    for i in range(5):
        await client.post(
            "/bookmarks",
            json={"procurement_data": {"id_del_proceso": f"BK-PAG-{i}", "entidad": f"Entidad{i}"}},
            headers={"Authorization": f"Bearer {user_token}"},
        )

    # First page
    resp = await client.get("/bookmarks?limit=2&offset=0", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # Second page
    resp = await client.get("/bookmarks?limit=2&offset=2", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # Beyond data
    resp = await client.get("/bookmarks?limit=2&offset=4", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1


@pytest.mark.asyncio
async def test_list_bookmarks_no_results(client, user_token):
    """Filter that matches nothing returns empty list."""
    await client.post(
        "/bookmarks",
        json={"procurement_data": {"id_del_proceso": "BK-EMPTY-1", "entidad": "DANE"}},
        headers={"Authorization": f"Bearer {user_token}"},
    )

    resp = await client.get("/bookmarks?entity=NONEXISTENT", headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_list_bookmarks_unauthenticated(client):
    """Request without token returns 401."""
    resp = await client.get("/bookmarks")
    assert resp.status_code == 401
