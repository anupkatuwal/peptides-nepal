from collections import Counter
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Query, Request, status
from sqlalchemy import select, true, update

from ..deps import AdminUser, CurrentUser, DbSession
from ..models import Order, OrderItem, Product
from ..rate_limit import ORDER_LIMIT, limiter
from ..schemas import OrderCreate, OrderOut, OrderStatus, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(ORDER_LIMIT)
def create_order(request: Request, body: OrderCreate, db: DbSession, user: CurrentUser) -> Order:
    # Merge repeated lines for the same product.
    wanted: Counter[int] = Counter()
    for line in body.items:
        wanted[line.product_id] += line.quantity

    products = {
        p.id: p
        for p in db.scalars(
            select(Product).where(Product.id.in_(wanted.keys()), Product.is_active == true())
        )
    }
    missing = [pid for pid in wanted if pid not in products]
    if missing:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"Unknown or unavailable product id(s): {missing}")

    try:
        order = Order(
            user_id=user.id,
            payment_method=body.payment_method,
            status="Pending",
            shipping_name=body.shipping_name,
            phone=body.phone,
            shipping_address=body.shipping_address,
            city=body.city,
            notes=body.notes or None,
            total_price=Decimal("0.00"),
        )
        total = Decimal("0.00")
        for pid, qty in wanted.items():
            # Atomic "take stock if enough is left". Two buyers racing for the
            # last unit can't both succeed: the second UPDATE matches no row.
            taken = db.execute(
                update(Product)
                .where(Product.id == pid, Product.stock_level >= qty)
                .values(stock_level=Product.stock_level - qty)
                .execution_options(synchronize_session=False)
            ).rowcount
            if taken != 1:
                raise HTTPException(
                    status.HTTP_409_CONFLICT,
                    f"Not enough stock for {products[pid].name}. Please lower the quantity.",
                )
            price = products[pid].price  # always the server's price, never the client's
            order.items.append(OrderItem(product_id=pid, quantity=qty, unit_price=price))
            total += price * qty

        order.total_price = total
        db.add(order)
        db.commit()
    except Exception:
        db.rollback()  # puts back any stock already taken in this request
        raise

    db.refresh(order)
    return order


@router.get("/me", response_model=list[OrderOut])
def my_orders(
    db: DbSession,
    user: CurrentUser,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> list[Order]:
    return list(
        db.scalars(
            select(Order).where(Order.user_id == user.id).order_by(Order.order_date.desc()).limit(limit)
        )
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: Annotated[int, Path(gt=0)], db: DbSession, user: CurrentUser) -> Order:
    order = db.get(Order, order_id)
    # Same 404 for "not yours" and "doesn't exist", so order ids can't be probed.
    if order is None or (order.user_id != user.id and user.role != "Admin"):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return order


# --- Admin -----------------------------------------------------------------


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: DbSession,
    _: AdminUser,
    status_filter: Annotated[OrderStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[Order]:
    stmt = select(Order).order_by(Order.order_date.desc()).limit(limit)
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
    return list(db.scalars(stmt))


@router.patch("/{order_id}/status", response_model=OrderOut)
def set_order_status(
    order_id: Annotated[int, Path(gt=0)], body: OrderStatusUpdate, db: DbSession, _: AdminUser
) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.status == "Cancelled":
        raise HTTPException(status.HTTP_409_CONFLICT, "A cancelled order can't be changed")
    if body.status == "Cancelled":
        # Return the stock to the shelf.
        for item in order.items:
            db.execute(
                update(Product)
                .where(Product.id == item.product_id)
                .values(stock_level=Product.stock_level + item.quantity)
                .execution_options(synchronize_session=False)
            )
    order.status = body.status
    db.commit()
    db.refresh(order)
    return order
