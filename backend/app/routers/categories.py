from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.models import Category
from app.schemas.schemas import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    """Fetch all active spend categories."""
    return db.query(Category).order_by(Category.name.asc()).all()
