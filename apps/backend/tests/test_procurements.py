import pytest
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_procurements_success(client):
    fake_response = [
        {
            "entidad": "DANE",
            "nit_entidad": "899999027",
            "id_del_proceso": "CO1.REQ.2577563",
            "nombre_del_procedimiento": "Prestación de servicios GEIH",
            "fecha_de_publicacion_del": "2022-01-18T00:00:00.000",
            "precio_base": "57333333",
            "modalidad_de_contratacion": "Contratación directa",
            "estado_del_procedimiento": "Seleccionado",
            "estado_de_apertura_del_proceso": "Abierto",
            "urlproceso": {"url": "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.2597221"},
        }
    ]

    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.get.return_value = MagicMock(status_code=200, json=lambda: fake_response)
        mock_client.return_value.__aenter__.return_value = mock_instance
        mock_client.return_value.__aexit__.return_value = AsyncMock()

        response = await client.get("/procurements?limit=10&offset=0")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["id_del_proceso"] == "CO1.REQ.2577563"
    assert data[0]["urlproceso"]["url"] == "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.2597221"


@pytest.mark.asyncio
async def test_procurements_empty_response(client):
    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.get.return_value = MagicMock(status_code=200, json=lambda: [])
        mock_client.return_value.__aenter__.return_value = mock_instance
        mock_client.return_value.__aexit__.return_value = AsyncMock()

        response = await client.get("/procurements?limit=10&offset=0")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_procurements_external_error_returns_empty_list(client):
    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.get.return_value = MagicMock(status_code=500, json=lambda: [])
        mock_client.return_value.__aenter__.return_value = mock_instance
        mock_client.return_value.__aexit__.return_value = AsyncMock()

        response = await client.get("/procurements?limit=10&offset=0")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_procurement_success(client, user_token):
    response = await client.post(
        "/procurements",
        json={
            "procurement_data": {
                "id_del_proceso": "CO1.REQ.2577563",
                "entidad": "DANE",
                "nombre_del_procedimiento": "GEIH",
            }
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["external_process_id"] == "CO1.REQ.2577563"
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_procurement_already_exists(client, user_token):
    payload = {
        "procurement_data": {
            "id_del_proceso": "CO1.REQ.EXISTS",
            "entidad": "DANE",
        }
    }
    r1 = await client.post(
        "/procurements", json=payload, headers={"Authorization": f"Bearer {user_token}"}
    )
    assert r1.status_code == 201
    id1 = r1.json()["id"]

    r2 = await client.post(
        "/procurements", json=payload, headers={"Authorization": f"Bearer {user_token}"}
    )
    # Second call: either 200 (found) or 201 (created) is acceptable
    # Both mean the operation succeeded; the key check is same id returned
    assert r2.status_code in (200, 201)
    assert r2.json()["id"] == id1


@pytest.mark.asyncio
async def test_create_procurement_unauthenticated(client):
    response = await client.post(
        "/procurements",
        json={"procurement_data": {"id_del_proceso": "CO1.REQ.2577563"}},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_procurements_limit_and_offset_params(client):
    """Pagination is exercised via integration test against real API."""
    with patch("httpx.AsyncClient") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.get.return_value = MagicMock(
            status_code=200,
            json=lambda: [{"id_del_proceso": "PROC-10"}],
        )
        mock_client.return_value.__aenter__.return_value = mock_instance
        mock_client.return_value.__aexit__.return_value = AsyncMock()

        response = await client.get("/procurements?limit=5&offset=10")

    assert response.status_code == 200
    mock_instance.get.assert_called_once()
    call_kwargs = mock_instance.get.call_args
    assert call_kwargs.kwargs["params"]["$limit"] == 5
    assert call_kwargs.kwargs["params"]["$offset"] == 10
