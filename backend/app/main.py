import logging
import sys
import os
from fastapi import FastAPI, Request, status, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.db import init_db
from app.routers import transactions, analytics, rewards, categories

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("digital_alpha.main")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds robust security headers to all responses."""
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Digital Alpha Technologies - Financial Transactions, Analytics & Rewards API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.cors_origin_list + ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    init_db()


@app.get("/api/health", tags=["system"])
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/api/seed", tags=["system"])
def seed_database():
    """Seed database with sample data (one-time setup)."""
    try:
        # Import here to avoid circular imports
        from app.models.models import Category, Transaction, Wallet, Reward, Redemption, Base
        from app.core.db import engine, SessionLocal
        import json
        from datetime import datetime, timezone
        
        # Check if data already exists
        db = SessionLocal()
        existing_count = db.query(Transaction).count()
        if existing_count > 0:
            db.close()
            return {
                "status": "already_seeded",
                "message": f"Database already has {existing_count} transactions",
                "transactions": existing_count
            }
        
        # Initialize schema
        Base.metadata.create_all(bind=engine)
        
        # Load transactions.json
        json_path = "transactions.json"
        if not os.path.exists(json_path):
            json_path = os.path.join(os.path.dirname(__file__), "..", "..", "transactions.json")
        
        if not os.path.exists(json_path):
            return {"status": "error", "message": "transactions.json not found"}
        
        with open(json_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
        
        # Seed initial rewards
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
        
        # Seed transactions and categories
        category_map = {}
        seen_ids = set()
        total_coins = 0
        transactions_to_insert = []
        
        for idx, item in enumerate(raw_data[:1000]):  # Limit to 1000 for faster seeding
            txn_id = str(item.get("id", "")).strip()
            if not txn_id:
                txn_id = f"TXN_{idx:08d}"
            
            if txn_id in seen_ids:
                continue
            seen_ids.add(txn_id)
            
            merchant = str(item.get("merchant", "Unknown")).strip() or "Unknown"
            cat_name = str(item.get("category", "Uncategorized")).strip() or "Uncategorized"
            amount = float(item.get("amount", 0))
            currency = "INR"
            status_val = str(item.get("status", "PENDING")).strip().upper()
            payment_method = str(item.get("payment_method", "Credit Card")).strip() or "Credit Card"
            
            if status_val not in ("SUCCESS", "FAILED", "PENDING"):
                status_val = "PENDING"
            
            coins_earned = 0
            if status_val == "SUCCESS" and amount > 0:
                coins_earned = min(int(amount // 100), 50)
                total_coins += coins_earned
            
            if cat_name not in category_map:
                cat_obj = Category(name=cat_name)
                db.add(cat_obj)
                db.flush()
                category_map[cat_name] = cat_obj
            
            txn = Transaction(
                id=txn_id,
                merchant=merchant,
                category_id=category_map[cat_name].id,
                amount=amount,
                currency=currency,
                status=status_val,
                payment_method=payment_method,
                is_refund=amount < 0,
                coins_earned=coins_earned,
                occurred_at=datetime.now(timezone.utc)
            )
            transactions_to_insert.append(txn)
        
        # Bulk insert
        for txn in transactions_to_insert:
            db.add(txn)
        db.commit()
        
        # Create wallet
        wallet = Wallet(
            coin_balance=total_coins,
            total_coins_earned=total_coins,
            total_coins_redeemed=0
        )
        db.add(wallet)
        db.commit()
        db.close()
        
        return {
            "status": "success",
            "message": "Database seeded successfully",
            "transactions": len(transactions_to_insert),
            "categories": len(category_map),
            "total_coins": total_coins,
            "rewards": len(INITIAL_REWARDS)
        }
    
    except Exception as e:
        logger.error(f"Seed error: {str(e)}", exc_info=True)
        return {
            "status": "error",
            "message": str(e)
        }


# Register all API routers
app.include_router(transactions.router)
app.include_router(analytics.router)
app.include_router(rewards.router)
app.include_router(categories.router)


@app.get("/", tags=["system"])
def root():
    return {
        "message": "Welcome to Digital Alpha API",
        "documentation": "/docs",
        "health": "/api/health"
    }
