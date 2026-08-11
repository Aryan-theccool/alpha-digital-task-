#!/usr/bin/env python3
"""
Digital Alpha Technologies - Seed & Data Ingestion Pipeline
Applies database schema and ingests 10,000 transactions from transactions.json
Handling deduplication, data cleansing, normalization, coin calculation, and rewards catalogue.
"""

import sys
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.db import engine, SessionLocal, init_db
from backend.app.core.config import settings
from backend.app.models.models import Category, Transaction, Wallet, Reward, Redemption, Base

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("digital_alpha.seed")


def parse_timestamp(val: Any) -> datetime:
    """Parse mixed timestamp formats into UTC datetime object."""
    if isinstance(val, (int, float)):
        # Check if timestamp is in milliseconds vs seconds
        if val > 1e11:
            val = val / 1000.0
        return datetime.fromtimestamp(val, tz=timezone.utc)
    
    if isinstance(val, str):
        val = val.strip()
        # Try ISO format with Z or timezone
        if val.endswith("Z"):
            try:
                return datetime.fromisoformat(val[:-1] + "+00:00")
            except ValueError:
                pass
        try:
            return datetime.fromisoformat(val)
        except ValueError:
            pass
        
        # Try various date and datetime formats
        formats = (
            "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%d %H:%M:%S",
            "%d/%m/%Y %H:%M:%S",
            "%m/%d/%Y %H:%M:%S",
            "%Y/%m/%d %H:%M:%S",
            "%d-%m-%Y %H:%M:%S",
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y"
        )
        for fmt in formats:
            try:
                return datetime.strptime(val, fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                pass
                
    # Fallback to current time if parsing fails
    logger.warning(f"Could not parse timestamp '{val}', falling back to UTC now")
    return datetime.now(timezone.utc)


def parse_amount(val: Any) -> float:
    """Parse numeric amount from float, int, or string."""
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        # Remove currency symbols or commas
        cleaned = val.replace("INR", "").replace("₹", "").replace(",", "").strip()
        return float(cleaned)
    return 0.0


def normalize_status(val: Any) -> str:
    """Normalize status to valid enum: SUCCESS, FAILED, PENDING."""
    if not val:
        return "PENDING"
    st = str(val).strip().upper()
    if st in ("SUCCESS", "FAILED", "PENDING"):
        return st
    return "PENDING"


def normalize_category_name(val: Any) -> str:
    """Normalize category name, defaulting null or empty to 'Uncategorized'."""
    if val is None:
        return "Uncategorized"
    cat = str(val).strip()
    if not cat or cat.lower() in ("none", "null", "undefined", "n/a", ""):
        return "Uncategorized"
    return cat


INITIAL_REWARDS = [
    {
        "title": "Amazon Pay Gift Card ₹100",
        "description": "Instant shopping voucher valid for all categories on Amazon India.",
        "category": "Shopping",
        "coin_cost": 100,
        "voucher_value_inr": 100.0,
        "icon": "shopping-bag"
    },
    {
        "title": "Swiggy & Zomato Dining Pass ₹250",
        "description": "Food & dining discount code applied directly at restaurant checkout.",
        "category": "Food & Dining",
        "coin_cost": 250,
        "voucher_value_inr": 250.0,
        "icon": "utensils"
    },
    {
        "title": "BookMyShow Movie Voucher ₹300",
        "description": "Unlock 2 cinema tickets or event passes across India.",
        "category": "Entertainment",
        "coin_cost": 300,
        "voucher_value_inr": 300.0,
        "icon": "film"
    },
    {
        "title": "Uber Premier Ride Pass ₹500",
        "description": "₹500 travel discount on your next 5 daily commutes or airport rides.",
        "category": "Travel",
        "coin_cost": 500,
        "voucher_value_inr": 500.0,
        "icon": "car"
    },
    {
        "title": "Croma Electronics Voucher ₹1,000",
        "description": "Instant voucher redeemable at all Croma offline stores and online.",
        "category": "Shopping",
        "coin_cost": 1000,
        "voucher_value_inr": 1000.0,
        "icon": "tv"
    },
    {
        "title": "Direct Card Statement Cashback ₹1,500",
        "description": "Direct statement credit applied to your primary credit-card balance.",
        "category": "Cashback",
        "coin_cost": 1500,
        "voucher_value_inr": 1500.0,
        "icon": "sparkles"
    }
]


def run_seed(json_path: str = "transactions.json") -> None:
    """Main database seeding routine."""
    logger.info(f"Starting seed process with dataset: {json_path}")

    if not os.path.exists(json_path):
        alt_path = os.path.join(os.path.dirname(__file__), "..", json_path)
        if os.path.exists(alt_path):
            json_path = alt_path
        else:
            raise FileNotFoundError(f"transactions.json not found at {json_path}")

    # Initialize schema
    init_db()

    with open(json_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    logger.info(f"Loaded {len(raw_data)} raw records from {json_path}")

    db = SessionLocal()
    try:
        # 1. Clear existing data for a clean idempotency run
        db.query(Redemption).delete()
        db.query(Reward).delete()
        db.query(Wallet).delete()
        db.query(Transaction).delete()
        db.query(Category).delete()
        db.commit()

        # 2. Seed initial rewards catalogue
        for reward_data in INITIAL_REWARDS:
            reward = Reward(
                title=reward_data["title"],
                description=reward_data["description"],
                category=reward_data["category"],
                coin_cost=reward_data["coin_cost"],
                voucher_value_inr=reward_data["voucher_value_inr"],
                icon=reward_data["icon"],
                is_active=True
            )
            db.add(reward)
        db.commit()
        logger.info(f"Seeded {len(INITIAL_REWARDS)} rewards in catalogue")

        # 3. Ingest Categories & Transactions with cleansing
        category_map: Dict[str, Category] = {}
        seen_ids = set()
        duplicate_count = 0
        total_coins_accumulated = 0
        transactions_to_insert = []

        for idx, item in enumerate(raw_data):
            txn_id = str(item.get("id", "")).strip()
            if not txn_id:
                txn_id = f"TXN_{idx:08d}"

            # Deduplication: first occurrence wins
            if txn_id in seen_ids:
                duplicate_count += 1
                continue
            seen_ids.add(txn_id)

            # Normalization
            merchant = str(item.get("merchant", "Unknown Merchant")).strip() or "Unknown Merchant"
            cat_name = normalize_category_name(item.get("category"))
            amount = parse_amount(item.get("amount", 0.0))
            currency = str(item.get("currency", "INR")).strip().upper() or "INR"
            status = normalize_status(item.get("status"))
            payment_method = str(item.get("payment_method", "Credit Card")).strip() or "Credit Card"
            occurred_at = parse_timestamp(item.get("timestamp"))

            # Determine refund flag
            is_refund = amount < 0

            # Calculate coins earned: 1 coin per ₹100 spent, capped at 50 per transaction
            coins_earned = 0
            if status == "SUCCESS" and not is_refund and amount > 0:
                calculated_coins = int(amount // settings.COIN_EARN_RATE_INR)
                coins_earned = min(calculated_coins, settings.MAX_COIN_CAP_PER_TXN)
                total_coins_accumulated += coins_earned

            # Ensure category exists in lookup map
            if cat_name not in category_map:
                cat_obj = Category(name=cat_name)
                db.add(cat_obj)
                db.flush()
                category_map[cat_name] = cat_obj

            category_id = category_map[cat_name].id

            txn = Transaction(
                id=txn_id,
                merchant=merchant,
                category_id=category_id,
                amount=amount,
                currency=currency,
                status=status,
                payment_method=payment_method,
                is_refund=is_refund,
                coins_earned=coins_earned,
                occurred_at=occurred_at
            )
            transactions_to_insert.append(txn)

        # Bulk insert transactions in batches
        BATCH_SIZE = 1000
        for i in range(0, len(transactions_to_insert), BATCH_SIZE):
            batch = transactions_to_insert[i:i + BATCH_SIZE]
            db.bulk_save_objects(batch)
            db.commit()

        # 4. Initialize single user wallet with total accumulated coins
        wallet = Wallet(
            coin_balance=total_coins_accumulated,
            total_coins_earned=total_coins_accumulated,
            total_coins_redeemed=0
        )
        db.add(wallet)
        db.commit()

        logger.info(
            f"Successfully seeded database:\n"
            f"  - Unique transactions ingested: {len(transactions_to_insert)}\n"
            f"  - Duplicates skipped: {duplicate_count}\n"
            f"  - Categories mapped: {len(category_map)}\n"
            f"  - Initial coin balance: {total_coins_accumulated:,} coins\n"
            f"  - Rewards catalogue: {len(INITIAL_REWARDS)} active rewards"
        )

    except Exception as e:
        db.rollback()
        logger.error(f"Error during database seed: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    target_json = sys.argv[1] if len(sys.argv) > 1 else "transactions.json"
    run_seed(target_json)
