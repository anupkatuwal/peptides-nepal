from fastapi import APIRouter, Request
from sqlalchemy import func, select, true

from ..deps import DbSession
from ..models import Category, Product
from ..rate_limit import limiter
from ..schemas import CategoryOut

router = APIRouter(prefix="/api/categories", tags=["catalogue"])


@router.get("", response_model=list[CategoryOut])
@limiter.limit("120/minute")
def list_categories(request: Request, db: DbSession) -> list[CategoryOut]:
    active_count = (
        select(Product.category_id.label("category_id"), func.count(Product.id).label("n"))
        .where(Product.is_active == true())
        .group_by(Product.category_id)
        .subquery()
    )
    rows = db.execute(
        select(Category, func.coalesce(active_count.c.n, 0))
        .outerjoin(active_count, active_count.c.category_id == Category.id)
        .order_by(Category.sort_order, Category.name)
    ).all()
    return [
        CategoryOut(id=c.id, name=c.name, slug=c.slug, description=c.description, product_count=n)
        for c, n in rows
    ]
