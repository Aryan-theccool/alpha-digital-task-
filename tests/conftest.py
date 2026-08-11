import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.core.db import get_db
from backend.app.models.models import Base, Wallet, Reward, Category, Transaction
from backend.app.main import app
from backend.seed import run_seed

# In-memory test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Seed the in-memory test database before running tests."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Create test categories
    cat_food = Category(name="Food & Dining")
    cat_travel = Category(name="Travel")
    cat_health = Category(name="Health")
    db.add_all([cat_food, cat_travel, cat_health])
    db.commit()

    # Create sample test transactions
    from datetime import datetime, timezone
    txns = [
        Transaction(
            id="TXN_TEST_001",
            merchant="Swiggy",
            category_id=cat_food.id,
            amount=450.0,
            currency="INR",
            status="SUCCESS",
            payment_method="UPI",
            is_refund=False,
            coins_earned=4,
            occurred_at=datetime(2026, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        ),
        Transaction(
            id="TXN_TEST_002",
            merchant="Uber",
            category_id=cat_travel.id,
            amount=1200.0,
            currency="INR",
            status="SUCCESS",
            payment_method="Credit Card",
            is_refund=False,
            coins_earned=12,
            occurred_at=datetime(2026, 1, 20, 14, 30, 0, tzinfo=timezone.utc)
        ),
        Transaction(
            id="TXN_TEST_003",
            merchant="Apollo Pharmacy",
            category_id=cat_health.id,
            amount=2500.0,
            currency="INR",
            status="FAILED",
            payment_method="Debit Card",
            is_refund=False,
            coins_earned=0,
            occurred_at=datetime(2026, 2, 5, 9, 15, 0, tzinfo=timezone.utc)
        ),
        Transaction(
            id="TXN_TEST_004",
            merchant="Zomato Refund",
            category_id=cat_food.id,
            amount=-150.0,
            currency="INR",
            status="SUCCESS",
            payment_method="UPI",
            is_refund=True,
            coins_earned=0,
            occurred_at=datetime(2026, 2, 10, 18, 0, 0, tzinfo=timezone.utc)
        )
    ]
    db.add_all(txns)

    # Add sample rewards
    r1 = Reward(
        title="Amazon ₹100 Voucher",
        description="Amazon shopping voucher",
        category="Shopping",
        coin_cost=100,
        voucher_value_inr=100.0,
        icon="shopping-bag",
        is_active=True
    )
    r2 = Reward(
        title="Luxury Travel Pass ₹5,000",
        description="Exclusive luxury pass",
        category="Travel",
        coin_cost=50000,
        voucher_value_inr=5000.0,
        icon="car",
        is_active=True
    )
    db.add_all([r1, r2])

    # Add sample wallet with 500 coins
    wallet = Wallet(coin_balance=500, total_coins_earned=500, total_coins_redeemed=0)
    db.add(wallet)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)
