import math
import io
import csv
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, asc

from backend.app.core.db import get_db
from backend.app.models.models import Transaction, Category
from backend.app.schemas.schemas import (
    TransactionsResponse,
    TransactionOut,
    TransactionPaginationMeta,
    CategoryOut
)

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


def apply_transaction_filters(
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
    """Reusable filter builder for transactions."""
    # 1. Filter: Category
    if category and category.strip() and category.lower() != "all":
        cat_clean = category.strip()
        if cat_clean.lower() == "uncategorized":
            query = query.filter(or_(Category.name.is_(None), Category.name == "Uncategorized"))
        else:
            query = query.filter(Category.name == cat_clean)

    # 2. Filter: Merchant search substring (case-insensitive)
    if search and search.strip():
        search_clean = f"%{search.strip()}%"
        query = query.filter(Transaction.merchant.ilike(search_clean))

    # 3. Filter: Status
    if status_filter and status_filter.strip() and status_filter.lower() != "all":
        st_clean = status_filter.strip().upper()
        query = query.filter(Transaction.status == st_clean)

    # 4. Filter: Payment method
    if payment_method and payment_method.strip() and payment_method.lower() != "all":
        pm_clean = payment_method.strip()
        query = query.filter(Transaction.payment_method == pm_clean)

    # 5. Filter: Amount range
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # 6. Filter: Date range
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


@router.get("/export/csv")
def export_transactions_csv(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    payment_method: Optional[str] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    sort_by: str = Query("occurred_at"),
    sort_order: str = Query("desc"),
    limit: int = Query(5000, ge=1, le=10000),
    db: Session = Depends(get_db)
):
    """
    Export matching ledger transactions directly as downloadable CSV.
    """
    query = db.query(
        Transaction,
        func.coalesce(Category.name, "Uncategorized").label("category_name")
    ).outerjoin(Category, Transaction.category_id == Category.id)

    query = apply_transaction_filters(
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

    sort_column_map = {
        "occurred_at": Transaction.occurred_at,
        "amount": Transaction.amount,
        "merchant": Transaction.merchant,
        "status": Transaction.status,
        "coins_earned": Transaction.coins_earned,
    }
    sort_column = sort_column_map.get(sort_by.lower(), Transaction.occurred_at)
    direction = desc if sort_order.lower() == "desc" else asc
    results = query.order_by(direction(sort_column)).limit(limit).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID",
        "Merchant",
        "Category",
        "Amount (INR)",
        "Currency",
        "Status",
        "Payment Mode",
        "Is Refund",
        "Coins Earned",
        "Date & Time (UTC)"
    ])

    for txn, cat_name in results:
        writer.writerow([
            txn.id,
            txn.merchant,
            cat_name,
            float(txn.amount),
            txn.currency,
            txn.status,
            txn.payment_method,
            "YES" if txn.is_refund else "NO",
            txn.coins_earned,
            txn.occurred_at.isoformat()
        ])

    csv_content = output.getvalue()
    filename = f"digital_alpha_ledger_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )


@router.get("", response_model=TransactionsResponse)
def get_transactions(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(25, ge=1, le=200, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    search: Optional[str] = Query(None, description="Search merchant substring"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (SUCCESS, FAILED, PENDING)"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method"),
    min_amount: Optional[float] = Query(None, description="Minimum transaction amount"),
    max_amount: Optional[float] = Query(None, description="Maximum transaction amount"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD or ISO)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD or ISO)"),
    sort_by: str = Query("occurred_at", description="Field to sort by (occurred_at, amount, merchant, status)"),
    sort_order: str = Query("desc", description="Sort direction (asc or desc)"),
    db: Session = Depends(get_db)
):
    """
    Fetch paginated, filtered, and sorted transactions with high-performance server-side execution.
    """
    query = db.query(
        Transaction,
        func.coalesce(Category.name, "Uncategorized").label("category_name")
    ).outerjoin(Category, Transaction.category_id == Category.id)

    query = apply_transaction_filters(
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

    # Total matching count
    total = query.count()
    total_pages = max(1, math.ceil(total / page_size)) if total > 0 else 1

    # Sorting
    sort_column_map = {
        "occurred_at": Transaction.occurred_at,
        "amount": Transaction.amount,
        "merchant": Transaction.merchant,
        "status": Transaction.status,
        "coins_earned": Transaction.coins_earned,
    }
    sort_column = sort_column_map.get(sort_by.lower(), Transaction.occurred_at)
    direction = desc if sort_order.lower() == "desc" else asc
    query = query.order_by(direction(sort_column))

    # Pagination offset and limit
    offset = (page - 1) * page_size
    results = query.offset(offset).limit(page_size).all()

    # Format items
    items: List[TransactionOut] = []
    for txn, cat_name in results:
        items.append(
            TransactionOut(
                id=txn.id,
                merchant=txn.merchant,
                amount=float(txn.amount),
                currency=txn.currency,
                status=txn.status,
                payment_method=txn.payment_method,
                is_refund=txn.is_refund,
                coins_earned=txn.coins_earned,
                occurred_at=txn.occurred_at,
                category=cat_name,
                category_id=txn.category_id,
                created_at=txn.created_at
            )
        )

    # Fetch available categories for frontend dropdown
    all_categories = [
        c[0] for c in db.query(Category.name).order_by(Category.name.asc()).all()
    ]

    return TransactionsResponse(
        items=items,
        meta=TransactionPaginationMeta(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        ),
        categories=all_categories
    )


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction_detail(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    Fetch full detail for a single transaction by its unique ID.
    """
    res = db.query(
        Transaction,
        func.coalesce(Category.name, "Uncategorized").label("category_name")
    ).outerjoin(Category, Transaction.category_id == Category.id).filter(
        Transaction.id == transaction_id
    ).first()

    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Transaction with ID '{transaction_id}' not found."
        )

    txn, cat_name = res
    return TransactionOut(
        id=txn.id,
        merchant=txn.merchant,
        amount=float(txn.amount),
        currency=txn.currency,
        status=txn.status,
        payment_method=txn.payment_method,
        is_refund=txn.is_refund,
        coins_earned=txn.coins_earned,
        occurred_at=txn.occurred_at,
        category=cat_name,
        category_id=txn.category_id,
        created_at=txn.created_at
    )
