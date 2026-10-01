from collections import Counter
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, HTTPException, Path, Query, Request, status
from sqlalchemy import select, true, update
from sqlalchemy.orm import joinedload

from .. import email
from ..delivery import delivery_fee, delivery_options, zone_available
from ..deps import AdminUser, CurrentUser, DbSession
from ..models import Order, OrderItem, Product
from ..rate_limit import ORDER_LIMIT, limiter
from ..schemas import AdminOrderOut, DeliveryOptions, OrderCreate, OrderOut, OrderStatus, OrderStatusUpdate

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("/delivery-options", response_model=DeliveryOptions)
def get_delivery_options() -> DeliveryOptions:
    return delivery_options()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(ORDER_LIMIT)
def create_order(
    request: Request, body: OrderCreate, db: DbSession, user: CurrentUser, background: BackgroundTasks
) -> Order:
    if not zone_available(body.delivery_zone):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "Sorry, we only deliver inside Kathmandu at the moment."
        )

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

        order.delivery_fee = delivery_fee(body.delivery_zone, total)
        order.total_price = total + order.delivery_fee
        db.add(order)
        db.commit()
    except Exception:
        db.rollback()  # puts back any stock already taken in this request
        raise

    db.refresh(order)
    email.preload(order)
    background.add_task(email.order_confirmation, order)
    background.add_task(email.new_order_alert, order)
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


@router.get("", response_model=list[AdminOrderOut])
def list_orders(
    db: DbSession,
    _: AdminUser,
    status_filter: Annotated[OrderStatus | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> list[Order]:
    stmt = select(Order).options(joinedload(Order.user)).order_by(Order.order_date.desc()).limit(limit)
    if status_filter:
        stmt = stmt.where(Order.status == status_filter)
    return list(db.scalars(stmt))


@router.patch("/{order_id}/status", response_model=AdminOrderOut)
def set_order_status(
    order_id: Annotated[int, Path(gt=0)],
    body: OrderStatusUpdate,
    db: DbSession,
    _: AdminUser,
    background: BackgroundTasks,
) -> Order:
    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.status == "Cancelled":
        raise HTTPException(status.HTTP_409_CONFLICT, "A cancelled order can't be changed")
    if body.status == "Cancelled":
        # Claim the cancel with a conditional update first, so two admins cancelling
        # at the same moment can't both put the stock back.
        claimed = db.execute(
            update(Order)
            .where(Order.id == order.id, Order.status != "Cancelled")
            .values(status="Cancelled")
            .execution_options(synchronize_session=False)
        ).rowcount
        if claimed != 1:
            db.rollback()
            raise HTTPException(status.HTTP_409_CONFLICT, "A cancelled order can't be changed")
        # Return the stock to the shelf.
        for item in order.items:
            db.execute(
                update(Product)
                .where(Product.id == item.product_id)
                .values(stock_level=Product.stock_level + item.quantity)
                .execution_options(synchronize_session=False)
            )
    changed = order.status != body.status
    order.status = body.status
    db.commit()
    db.refresh(order)
    email.preload(order)
    if changed:
        background.add_task(email.order_status_update, order)
    return order
