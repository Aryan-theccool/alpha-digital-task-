from datetime import datetime
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, asc, case

from app.core.db import get_db
from app.models.models import Transaction, Category
from app.schemas.schemas import (
    CategorySpendResponse,
    CategorySpendItem,
    MonthlyTrendResponse,
    MonthlyTrendItem,
)

router = APIRouter(prefix="/api/transactions/analytics", tags=["analytics"])


def apply_analytics_filters(
    query,
    category: Optional[str] = None,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    payment_method: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Helper to apply filters consistently across all analytics endpoints."""
    # Category filter
    if category and category.strip() and category.lower() != "all":
        cat_clean = category.strip()
        if cat_clean.lower() == "uncategorized":
            query = query.filter(or_(Category.name.is_(None), Category.name == "Uncategorized"))
        else:
            query = query.filter(Category.name == cat_clean)

    # Merchant search
    if search and search.strip():
        search_clean = f"%{search.strip()}%"
        query = query.filter(Transaction.merchant.ilike(search_clean))

    # Status
    if status_filter and status_filter.strip() and status_filter.lower() != "all":
        st_clean = status_filter.strip().upper()
        query = query.filter(Transaction.status == st_clean)

    # Payment Method
    if payment_method and payment_method.strip() and payment_method.lower() != "all":
        query = query.filter(Transaction.payment_method == payment_method.strip())

    # Amount range
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # Date range
    if start_date and start_date.strip():
        try:
            start_dt = datetime.fromisoformat(start_date.strip().replace("Z", "+00:00"))
            query = query.filter(Transaction.occurred_at >= start_dt)
        except ValueError:
            try:
                start_dt = datetime.strptime(start_date.strip(), "%Y-%m-%d")
                query = query.filter(Transaction.occurred_at >= start_dt)
            except ValueError:
                pass

    if end_date and end_date.strip():
        try:
            end_dt = datetime.fromisoformat(end_date.strip().replace("Z", "+00:00"))
            query = query.filter(Transaction.occurred_at <= end_dt)
        except ValueError:
            try:
                end_dt = datetime.strptime(end_date.strip(), "%Y-%m-%d").replace(hour=23, minute=59, second=59)
                query = query.filter(Transaction.occurred_at <= end_dt)
            except ValueError:
                pass

    return query


@router.get("/by-category", response_model=CategorySpendResponse)
def get_spend_by_category(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Aggregate spend grouped by category (excluding refunds and failed transactions by default for spend metrics).
    """
    query = db.query(
        func.coalesce(Category.name, "Uncategorized").label("category_name"),
        func.sum(Transaction.amount).label("category_total"),
        func.count(Transaction.id).label("txn_count")
    ).outerjoin(Category, Transaction.category_id == Category.id)

    if not status_filter:
        query = query.filter(Transaction.status == "SUCCESS")
    query = query.filter(Transaction.is_refund == False, Transaction.amount > 0)

    query = apply_analytics_filters(
        query,
        category=category,
        search=search,
        status_filter=status_filter,
        payment_method=payment_method,
        min_amount=min_amount,
        max_amount=max_amount,
        start_date=start_date,
        end_date=end_date
    )

    results = query.group_by("category_name").order_by(desc("category_total")).all()

    total_spend = sum(float(r.category_total or 0) for r in results)
    total_txns = sum(int(r.txn_count or 0) for r in results)

    items: List[CategorySpendItem] = []
    for r in results:
        amt = float(r.category_total or 0)
        cnt = int(r.txn_count or 0)
        pct = (amt / total_spend * 100.0) if total_spend > 0 else 0.0
        items.append(
            CategorySpendItem(
                category=r.category_name,
                total_amount=round(amt, 2),
                transaction_count=cnt,
                percentage=round(pct, 1)
            )
        )

    return CategorySpendResponse(
        total_spend=round(total_spend, 2),
        total_transactions=total_txns,
        data=items
    )


@router.get("/monthly-trend", response_model=MonthlyTrendResponse)
def get_monthly_spend_trend(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    High-performance database-level monthly spend trend aggregation.
    Uses native SQL date formatting for SQLite (strftime) and PostgreSQL (to_char).
    """
    dialect = db.bind.dialect.name if db.bind else "sqlite"
    if dialect == "sqlite":
        month_expr = func.strftime("%Y-%m", Transaction.occurred_at)
    else:
        month_expr = func.to_char(Transaction.occurred_at, "YYYY-MM")

    query = db.query(
        month_expr.label("month_key"),
        func.sum(Transaction.amount).label("total_spend"),
        func.count(Transaction.id).label("transaction_count"),
        func.sum(Transaction.coins_earned).label("coins_earned")
    ).outerjoin(Category, Transaction.category_id == Category.id)

    if not status_filter:
        query = query.filter(Transaction.status == "SUCCESS")
    query = query.filter(Transaction.is_refund == False, Transaction.amount > 0)

    query = apply_analytics_filters(
        query,
        category=category,
        search=search,
        status_filter=status_filter,
        payment_method=payment_method,
        min_amount=min_amount,
        max_amount=max_amount,
        start_date=start_date,
        end_date=end_date
    )

    results = query.group_by(month_expr).order_by(month_expr.asc()).all()

    data: List[MonthlyTrendItem] = []
    for r in results:
        m_key = str(r.month_key)
        # Convert "YYYY-MM" to readable label like "Oct 2025"
        try:
            date_obj = datetime.strptime(m_key, "%Y-%m")
            label = date_obj.strftime("%b %Y")
        except ValueError:
            label = m_key

        data.append(
            MonthlyTrendItem(
                month_key=m_key,
                month_label=label,
                total_spend=round(float(r.total_spend or 0), 2),
                transaction_count=int(r.transaction_count or 0),
                coins_earned=int(r.coins_earned or 0)
            )
        )

    return MonthlyTrendResponse(data=data)


@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """
    Single-pass optimized overview metrics query.
    """
    row = db.query(
        func.count(Transaction.id).label("total_txns"),
        func.sum(case((Transaction.status == "SUCCESS", 1), else_=0)).label("success_txns"),
        func.sum(
            case(
                ((Transaction.status == "SUCCESS") & (Transaction.is_refund == False) & (Transaction.amount > 0), Transaction.amount),
                else_=0
            )
        ).label("total_spend"),
        func.sum(case((Transaction.is_refund == True, 1), else_=0)).label("refunds_count"),
        func.sum(case((Transaction.is_refund == True, Transaction.amount), else_=0)).label("refunds_amount"),
        func.sum(Transaction.coins_earned).label("total_coins")
    ).first()

    total_txns = int(row.total_txns or 0)
    success_txns = int(row.success_txns or 0)
    total_spend = float(row.total_spend or 0.0)
    refunds_count = int(row.refunds_count or 0)
    refunds_amount = float(row.refunds_amount or 0.0)
    total_coins = int(row.total_coins or 0)

    success_rate = (success_txns / total_txns * 100.0) if total_txns > 0 else 0.0
    avg_ticket = (total_spend / success_txns) if success_txns > 0 else 0.0

    return {
        "total_transactions": total_txns,
        "successful_transactions": success_txns,
        "success_rate_percentage": round(success_rate, 1),
        "total_spend_inr": round(total_spend, 2),
        "average_ticket_inr": round(avg_ticket, 2),
        "total_refunds_count": refunds_count,
        "total_refunds_amount_inr": round(refunds_amount, 2),
        "total_coins_earned": total_coins
    }
