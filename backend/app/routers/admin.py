from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import false, func, select, true
from sqlalchemy.orm import joinedload

from ..deps import AdminUser, DbSession
from ..models import ContactMessage, Order, Product, utcnow
from ..schemas import ProductDetail

router = APIRouter(prefix="/api/admin", tags=["admin"])

LOW_STOCK = 5


class AdminProductOut(ProductDetail):
    is_active: bool


class AdminSummary(BaseModel):
    orders_by_status: dict[str, int]
    revenue_30d: float
    orders_30d: int
    unread_messages: int
    low_stock: list[AdminProductOut]
    missing_lab_results: int


@router.get("/summary", response_model=AdminSummary)
def summary(db: DbSession, _: AdminUser) -> AdminSummary:
    by_status = dict(db.execute(select(Order.status, func.count()).group_by(Order.status)).all())
    since = utcnow() - timedelta(days=30)
    revenue, count = db.execute(
        select(func.coalesce(func.sum(Order.total_price), 0), func.count())
        .where(Order.order_date >= since, Order.status != "Cancelled")
    ).one()
    unread = db.scalar(select(func.count()).select_from(ContactMessage).where(ContactMessage.is_read == false())) or 0
    active = select(Product).options(joinedload(Product.category)).where(Product.is_active == true())
    low = db.scalars(active.where(Product.stock_level <= LOW_STOCK).order_by(Product.stock_level)).all()
    missing = db.scalar(
        select(func.count()).select_from(Product)
        .where(Product.is_active == true(), (Product.purity_percentage.is_(None)) | (Product.coa_image_url.is_(None)))
    ) or 0
    return AdminSummary(
        orders_by_status=by_status,
        revenue_30d=float(revenue),
        orders_30d=count,
        unread_messages=unread,
        low_stock=low,
        missing_lab_results=missing,
    )


@router.get("/products", response_model=list[AdminProductOut])
def all_products(
    db: DbSession,
    _: AdminUser,
    limit: Annotated[int, Query(ge=1, le=500)] = 500,
) -> list[Product]:
    """Every product, including hidden ones."""
    return list(
        db.scalars(select(Product).options(joinedload(Product.category)).order_by(Product.name).limit(limit))
    )
