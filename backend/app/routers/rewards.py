import uuid
import secrets
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.core.db import get_db
from backend.app.models.models import Wallet, Reward, Redemption
from backend.app.schemas.schemas import (
    WalletOut,
    RewardOut,
    RedeemRequest,
    RedeemResponse,
    RedemptionReceipt,
    RedemptionHistoryItem
)

router = APIRouter(prefix="/api", tags=["wallet-and-rewards"])


def generate_voucher_code(prefix: str = "ALPHA") -> str:
    """Generate a clean, readable redemption voucher code."""
    part1 = secrets.token_hex(2).upper()
    part2 = secrets.token_hex(2).upper()
    return f"{prefix}-{part1}-{part2}"


@router.get("/wallet", response_model=WalletOut)
def get_wallet(db: Session = Depends(get_db)):
    """Fetch current user coin balance and lifetime earnings/redemptions."""
    wallet = db.query(Wallet).first()
    if not wallet:
        # Auto-create if not initialized
        wallet = Wallet(coin_balance=0, total_coins_earned=0, total_coins_redeemed=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


@router.get("/rewards", response_model=List[RewardOut])
def get_rewards_catalogue(db: Session = Depends(get_db)):
    """Fetch active rewards available for coin redemption."""
    return db.query(Reward).filter(Reward.is_active == True).order_by(Reward.coin_cost.asc()).all()


@router.post("/rewards/redeem", response_model=RedeemResponse)
def redeem_reward(payload: RedeemRequest, db: Session = Depends(get_db)):
    """
    Atomically redeem coins against a reward voucher.
    Locks wallet row with SELECT ... FOR UPDATE to guarantee thread safety and prevent race conditions.
    """
    try:
        # 1. Fetch reward
        reward = db.query(Reward).filter(
            Reward.id == payload.reward_id,
            Reward.is_active == True
        ).first()

        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reward with ID {payload.reward_id} does not exist or is inactive."
            )

        # 2. Acquire lock on wallet row (FOR UPDATE)
        # Handles SQLite dialect gracefully if running in local dev
        wallet_query = db.query(Wallet)
        if db.bind and db.bind.dialect.name != "sqlite":
            wallet_query = wallet_query.with_for_update()

        wallet = wallet_query.first()
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Wallet account could not be found."
            )

        # 3. Check sufficient coin balance
        if wallet.coin_balance < reward.coin_cost:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "error": "INSUFFICIENT_COINS",
                    "message": f"Insufficient coin balance. You need {reward.coin_cost:,} coins for this reward, but have {wallet.coin_balance:,} coins.",
                    "required_coins": reward.coin_cost,
                    "current_balance": wallet.coin_balance
                }
            )

        # 4. Perform atomic deduction and log redemption
        voucher_code = generate_voucher_code(prefix=reward.category[:3].upper())
        wallet.coin_balance -= reward.coin_cost
        wallet.total_coins_redeemed += reward.coin_cost
        wallet.updated_at = datetime.utcnow()

        redemption = Redemption(
            reward_id=reward.id,
            coins_spent=reward.coin_cost,
            voucher_code=voucher_code,
            redeemed_at=datetime.utcnow()
        )
        db.add(redemption)
        db.commit()
        db.refresh(wallet)
        db.refresh(redemption)

        receipt = RedemptionReceipt(
            id=redemption.id,
            reward_id=reward.id,
            reward_title=reward.title,
            coins_spent=redemption.coins_spent,
            voucher_code=redemption.voucher_code,
            voucher_value_inr=float(reward.voucher_value_inr),
            redeemed_at=redemption.redeemed_at
        )

        return RedeemResponse(
            success=True,
            message=f"Successfully redeemed '{reward.title}' for {reward.coin_cost:,} coins!",
            new_coin_balance=wallet.coin_balance,
            redemption=receipt
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while processing redemption: {str(e)}"
        )


@router.get("/rewards/history", response_model=List[RedemptionHistoryItem])
def get_redemption_history(db: Session = Depends(get_db)):
    """Fetch user's previous redemption history."""
    redemptions = db.query(Redemption).join(Reward).order_by(desc(Redemption.redeemed_at)).all()
    history = []
    for r in redemptions:
        history.append(
            RedemptionHistoryItem(
                id=r.id,
                reward_title=r.reward.title if r.reward else "Reward Voucher",
                voucher_value_inr=float(r.reward.voucher_value_inr) if r.reward else 0.0,
                coins_spent=r.coins_spent,
                voucher_code=r.voucher_code,
                redeemed_at=r.redeemed_at
            )
        )
    return history
