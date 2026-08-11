import pytest


def test_get_wallet_balance(client):
    response = client.get("/api/wallet")
    assert response.status_code == 200
    data = response.json()
    assert "coin_balance" in data
    assert data["coin_balance"] >= 0


def test_get_rewards_catalogue(client):
    response = client.get("/api/rewards")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["coin_cost"] > 0


def test_redeem_reward_success(client):
    # Fetch available rewards
    rewards = client.get("/api/rewards").json()
    affordable_reward = next(r for r in rewards if r["coin_cost"] <= 100)

    # Fetch initial balance
    initial_wallet = client.get("/api/wallet").json()
    initial_balance = initial_wallet["coin_balance"]

    # Redeem
    response = client.post("/api/rewards/redeem", json={"reward_id": affordable_reward["id"]})
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert res_data["new_coin_balance"] == initial_balance - affordable_reward["coin_cost"]
    assert "voucher_code" in res_data["redemption"]
    assert res_data["redemption"]["coins_spent"] == affordable_reward["coin_cost"]


def test_redeem_reward_insufficient_coins_422(client):
    # Fetch unaffordable reward (costs 50,000 coins)
    rewards = client.get("/api/rewards").json()
    expensive_reward = next(r for r in rewards if r["coin_cost"] > 10000)

    # Initial balance check
    initial_wallet = client.get("/api/wallet").json()
    initial_balance = initial_wallet["coin_balance"]

    # Attempt redeem
    response = client.post("/api/rewards/redeem", json={"reward_id": expensive_reward["id"]})
    assert response.status_code == 422

    # Verify balance did NOT change
    wallet_after = client.get("/api/wallet").json()
    assert wallet_after["coin_balance"] == initial_balance


def test_redeem_nonexistent_reward_404(client):
    response = client.post("/api/rewards/redeem", json={"reward_id": 999999})
    assert response.status_code == 404


def test_redemption_history(client):
    response = client.get("/api/rewards/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "voucher_code" in data[0]
