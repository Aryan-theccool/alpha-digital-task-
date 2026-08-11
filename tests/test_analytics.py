import pytest


def test_category_spend_analytics(client):
    response = client.get("/api/transactions/analytics/by-category")
    assert response.status_code == 200
    data = response.json()
    assert "total_spend" in data
    assert "data" in data
    assert data["total_spend"] > 0
    # Check that categories exist
    categories = [item["category"] for item in data["data"]]
    assert "Food & Dining" in categories or "Travel" in categories


def test_monthly_trend_analytics(client):
    response = client.get("/api/transactions/analytics/monthly-trend")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) >= 1
    assert "month_key" in data["data"][0]
    assert "total_spend" in data["data"][0]


def test_analytics_summary(client):
    response = client.get("/api/transactions/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_transactions" in data
    assert "successful_transactions" in data
    assert "total_spend_inr" in data
    assert "success_rate_percentage" in data
