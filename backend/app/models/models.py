from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    Text,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True)
    merchant = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False, index=True)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(20), nullable=False, index=True)  # SUCCESS, FAILED, PENDING
    payment_method = Column(String(50), default="Credit Card", nullable=False)
    is_refund = Column(Boolean, default=False, nullable=False)
    coins_earned = Column(Integer, default=0, nullable=False)
    occurred_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    category = relationship("Category", back_populates="transactions")

    __table_args__ = (
        CheckConstraint("status IN ('SUCCESS', 'FAILED', 'PENDING')", name="check_valid_status"),
        Index("ix_transactions_status_occurred", "status", "occurred_at"),
    )


class Wallet(Base):
    __tablename__ = "wallet"

    id = Column(Integer, primary_key=True, autoincrement=True)
    coin_balance = Column(Integer, default=0, nullable=False)
    total_coins_earned = Column(Integer, default=0, nullable=False)
    total_coins_redeemed = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint("coin_balance >= 0", name="check_positive_coin_balance"),
    )


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Voucher", nullable=False)
    coin_cost = Column(Integer, nullable=False)
    voucher_value_inr = Column(Numeric(10, 2), nullable=False)
    icon = Column(String(50), default="gift", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    redemptions = relationship("Redemption", back_populates="reward")

    __table_args__ = (
        CheckConstraint("coin_cost > 0", name="check_positive_cost"),
    )


class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reward_id = Column(Integer, ForeignKey("rewards.id", ondelete="RESTRICT"), nullable=False)
    coins_spent = Column(Integer, nullable=False)
    voucher_code = Column(String(64), nullable=False)
    redeemed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    reward = relationship("Reward", back_populates="redemptions")

    __table_args__ = (
        CheckConstraint("coins_spent > 0", name="check_positive_spent"),
    )
