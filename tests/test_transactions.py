import pytest


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_transactions_pagination(client):
    response = client.get("/api/transactions?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "meta" in data
    assert len(data["items"]) <= 2
    assert data["meta"]["page"] == 1
    assert data["meta"]["page_size"] == 2
    assert data["meta"]["total"] >= 4


def test_get_transactions_category_filter(client):
    response = client.get("/api/transactions?category=Food %26 Dining")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category"] == "Food & Dining"


def test_get_transactions_status_filter(client):
    response = client.get("/api/transactions?status=FAILED")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["status"] == "FAILED"


def test_get_transactions_merchant_search(client):
    response = client.get("/api/transactions?search=Uber")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["merchant"] == "Uber"


def test_get_transactions_amount_sorting(client):
    response = client.get("/api/transactions?sort_by=amount&sort_order=desc")
    assert response.status_code == 200
    data = response.json()
    amounts = [item["amount"] for item in data["items"]]
    assert amounts == sorted(amounts, reverse=True)


def test_get_transaction_by_id_success(client):
    response = client.get("/api/transactions/TXN_TEST_001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "TXN_TEST_001"
    assert data["merchant"] == "Swiggy"
    assert data["amount"] == 450.0


def test_get_transaction_by_id_404(client):
    response = client.get("/api/transactions/NON_EXISTENT_ID")
    assert response.status_code == 404


def test_export_transactions_csv(client):
    response = client.get("/api/transactions/export/csv")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "Transaction ID" in response.text
    assert "Merchant" in response.text
