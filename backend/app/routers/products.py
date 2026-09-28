from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Path, Query, Request, status
from sqlalchemy import func, select, true
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from ..deps import AdminUser, DbSession
from ..models import Category, Product
from ..rate_limit import limiter
from ..schemas import SLUG_RE, ProductCreate, ProductDetail, ProductPage, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["catalogue"])

SortOption = Literal["newest", "price_asc", "price_desc", "name"]

_ORDERING = {
    "newest": (Product.created_at.desc(), Product.id.desc()),
    "price_asc": (Product.price.asc(), Product.id.asc()),
    "price_desc": (Product.price.desc(), Product.id.desc()),
    "name": (Product.name.asc(), Product.id.asc()),
}


@router.get("", response_model=ProductPage)
@limiter.limit("120/minute")
def list_products(
    request: Request,
    db: DbSession,
    category: Annotated[str | None, Query(max_length=80, pattern=SLUG_RE)] = None,
    q: Annotated[str | None, Query(min_length=1, max_length=80)] = None,
    in_stock: bool = False,
    sort: SortOption = "newest",
    page: Annotated[int, Query(ge=1, le=1000)] = 1,
    page_size: Annotated[int, Query(ge=1, le=60)] = 24,
) -> ProductPage:
    filters = [Product.is_active == true()]
    if category:
        filters.append(Category.slug == category)
    if q:
        # Bound parameter; autoescape makes % and _ in the search text literal.
        filters.append(Product.name.contains(q.strip(), autoescape=True))
    if in_stock:
        filters.append(Product.stock_level > 0)

    base = select(Product).join(Product.category).where(*filters)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    items = db.scalars(
        base.options(joinedload(Product.category))
        .order_by(*_ORDERING[sort])
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return ProductPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/{slug}", response_model=ProductDetail)
@limiter.limit("120/minute")
def get_product(
    request: Request,
    db: DbSession,
    slug: Annotated[str, Path(max_length=160, pattern=SLUG_RE)],
) -> Product:
    product = db.scalar(
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.slug == slug, Product.is_active == true())
    )
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


# --- Admin -----------------------------------------------------------------


@router.post("", response_model=ProductDetail, status_code=status.HTTP_201_CREATED)
def create_product(body: ProductCreate, db: DbSession, _: AdminUser) -> Product:
    if db.get(Category, body.category_id) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown category_id")
    product = Product(**body.model_dump())
    db.add(product)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "A product with this slug already exists") from None
    db.refresh(product)
    return product


@router.patch("/{product_id}", response_model=ProductDetail)
def update_product(
    product_id: Annotated[int, Path(gt=0)], body: ProductUpdate, db: DbSession, _: AdminUser
) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    changes = body.model_dump(exclude_unset=True)
    # Only these may be cleared; the rest are required columns.
    required = {k for k, v in changes.items() if v is None} - {"purity_percentage", "coa_image_url", "image_url"}
    if required:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"These fields can't be empty: {sorted(required)}")
    if "category_id" in changes and db.get(Category, changes["category_id"]) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Unknown category_id")
    for field, value in changes.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product
