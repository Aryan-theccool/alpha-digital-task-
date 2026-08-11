from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# Category Schemas
class CategoryBase(BaseModel):
    name: str


class CategoryOut(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Transaction Schemas
class TransactionBase(BaseModel):
    id: str
    merchant: str
    amount: float
    currency: str = "INR"
    status: str
    payment_method: str
    is_refund: bool = False
    coins_earned: int = 0
    occurred_at: datetime


class TransactionOut(TransactionBase):
    category: Optional[str] = "Uncategorized"
    category_id: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TransactionPaginationMeta(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class TransactionsResponse(BaseModel):
    items: List[TransactionOut]
    meta: TransactionPaginationMeta
    categories: List[str]


# Spend Analytics Schemas
class CategorySpendItem(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage: float


class CategorySpendResponse(BaseModel):
    total_spend: float
    total_transactions: int
    data: List[CategorySpendItem]


class MonthlyTrendItem(BaseModel):
    month_key: str  # e.g., "2025-10"
    month_label: str  # e.g., "Oct 2025"
    total_spend: float
    transaction_count: int
    coins_earned: int


class MonthlyTrendResponse(BaseModel):
    data: List[MonthlyTrendItem]


# Wallet & Rewards Schemas
class WalletOut(BaseModel):
    coin_balance: int
    total_coins_earned: int
    total_coins_redeemed: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RewardOut(BaseModel):
    id: int
    title: str
    description: str
    category: str
    coin_cost: int
    voucher_value_inr: float
    icon: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class RedeemRequest(BaseModel):
    reward_id: int = Field(..., gt=0)


class RedemptionReceipt(BaseModel):
    id: int
    reward_id: int
    reward_title: str
    coins_spent: int
    voucher_code: str
    voucher_value_inr: float
    redeemed_at: datetime


class RedeemResponse(BaseModel):
    success: bool
    message: str
    new_coin_balance: int
    redemption: RedemptionReceipt


class RedemptionHistoryItem(BaseModel):
    id: int
    reward_title: str
    voucher_value_inr: float
    coins_spent: int
    voucher_code: str
    redeemed_at: datetime
    model_config = ConfigDict(from_attributes=True)
