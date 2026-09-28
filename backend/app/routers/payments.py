import logging
from typing import Annotated, Literal

from fastapi import APIRouter, BackgroundTasks, HTTPException, Path, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError

from .. import email, payments
from ..config import get_settings
from ..deps import CurrentUser, DbSession
from ..models import Order, utcnow
from ..rate_limit import limiter
from ..schemas import RequestModel

logger = logging.getLogger("peptides_nepal.payments")

router = APIRouter(prefix="/api/payments", tags=["payments"])

PAYMENT_LIMIT = "20/minute;100/hour"


class PaymentMethods(BaseModel):
    esewa: bool
    khalti: bool
    test_mode: bool


class PaymentStart(BaseModel):
    gateway: Literal["esewa", "khalti"]
    # Khalti: send the browser here.
    redirect_url: str | None = None
    # eSewa: the browser must POST these fields to form_action.
    form_action: str | None = None
    form_fields: dict[str, str] | None = None


class EsewaConfirm(RequestModel):
    data: str = Field(min_length=10, max_length=4000)


class KhaltiConfirm(RequestModel):
    pidx: str = Field(min_length=5, max_length=100, pattern=r"^[A-Za-z0-9]+$")


class PaymentResult(BaseModel):
    order_id: int
    paid: bool
    detail: str


@router.get("/methods", response_model=PaymentMethods)
def methods() -> PaymentMethods:
    return PaymentMethods(
        esewa=payments.esewa_credentials() is not None,
        khalti=payments.khalti_enabled(),
        test_mode=get_settings().payments_env == "test",
    )


@router.post("/orders/{order_id}/start", response_model=PaymentStart)
@limiter.limit(PAYMENT_LIMIT)
def start_payment(
    request: Request, order_id: Annotated[int, Path(gt=0)], db: DbSession, user: CurrentUser
) -> PaymentStart:
    order = db.get(Order, order_id)
    if order is None or order.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.payment_method == "COD":
        raise HTTPException(status.HTTP_409_CONFLICT, "This order is cash on delivery")
    if order.payment_status == "Paid":
        raise HTTPException(status.HTTP_409_CONFLICT, "This order is already paid")
    if order.status == "Cancelled":
        raise HTTPException(status.HTTP_409_CONFLICT, "This order was cancelled")

    front = get_settings().frontend_url.rstrip("/")
    try:
        if order.payment_method == "eSewa":
            if payments.esewa_credentials() is None:
                raise HTTPException(status.HTTP_409_CONFLICT, "Online eSewa payment isn't available. We'll contact you.")
            reference = payments.new_transaction_uuid(order.id)
            action, fields = payments.esewa_form(
                order.total_price,
                reference,
                # Paths only: eSewa appends "?data=..." to these URLs as-is.
                success_url=f"{front}/payment/esewa",
                failure_url=f"{front}/payment/esewa/failed/{order.id}",
            )
            result = PaymentStart(gateway="esewa", form_action=action, form_fields=fields)
        else:
            if not payments.khalti_enabled():
                raise HTTPException(status.HTTP_409_CONFLICT, "Online Khalti payment isn't available. We'll contact you.")
            reference, url = payments.khalti_initiate(
                order.id,
                order.total_price,
                return_url=f"{front}/payment/khalti",
                website_url=front,
                name=order.shipping_name,
                email=user.email,
                phone=order.phone,
            )
            result = PaymentStart(gateway="khalti", redirect_url=url)
    except payments.GatewayError:
        logger.exception("Payment start failed for order %s", order.id)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "The payment service didn't respond. Please try again.") from None

    order.payment_reference = reference
    order.payment_status = "Initiated"
    try:
        db.commit()
    except IntegrityError:  # reference collision; astronomically unlikely
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Please try again.") from None
    return result


def _settle(db, order: Order, gateway: payments.GatewayStatus, background: BackgroundTasks) -> PaymentResult:
    """Apply a verified gateway status to the order."""
    if gateway.paid:
        if gateway.amount is not None and gateway.amount != order.total_price:
            logger.error("Amount mismatch on order %s: gateway %s, order %s", order.id, gateway.amount, order.total_price)
            raise HTTPException(status.HTTP_409_CONFLICT, "The paid amount doesn't match the order. We'll contact you.")
        # Conditional update: if two confirmations race, only one wins and sends the email.
        won = db.execute(
            update(Order)
            .where(Order.id == order.id, Order.payment_status != "Paid")
            .values(payment_status="Paid", paid_at=utcnow())
            .execution_options(synchronize_session=False)
        ).rowcount
        if won:
            db.execute(
                update(Order)
                .where(Order.id == order.id, Order.status == "Pending")
                .values(status="Paid")
                .execution_options(synchronize_session=False)
            )
        db.commit()
        if won:
            db.refresh(order)
            email.preload(order)
            background.add_task(email.order_status_update, order)
        return PaymentResult(order_id=order.id, paid=True, detail="Payment received. Thank you!")

    if gateway.final_failure and order.payment_status != "Paid":
        order.payment_status = "Failed"
        db.commit()
        return PaymentResult(order_id=order.id, paid=False, detail="The payment wasn't completed. You can try again.")
    return PaymentResult(
        order_id=order.id, paid=False, detail="The payment is still processing. We'll email you when it's confirmed."
    )


@router.post("/esewa/confirm", response_model=PaymentResult)
@limiter.limit(PAYMENT_LIMIT)
def confirm_esewa(request: Request, body: EsewaConfirm, db: DbSession, background: BackgroundTasks) -> PaymentResult:
    try:
        payload = payments.esewa_decode_response(body.data)
    except ValueError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This payment response isn't valid.") from None
    except payments.GatewayError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Online eSewa payment isn't available.") from None

    order = db.scalar(
        select(Order).where(Order.payment_reference == payload.get("transaction_uuid"), Order.payment_method == "eSewa")
    )
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found for this payment")
    if order.payment_status == "Paid":
        return PaymentResult(order_id=order.id, paid=True, detail="Payment received. Thank you!")
    try:
        # Don't rely on the redirect alone: ask eSewa directly.
        gateway = payments.esewa_status(order.payment_reference, order.total_price)
    except payments.GatewayError:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Couldn't confirm with eSewa. Please refresh in a minute.") from None
    return _settle(db, order, gateway, background)


@router.post("/khalti/confirm", response_model=PaymentResult)
@limiter.limit(PAYMENT_LIMIT)
def confirm_khalti(request: Request, body: KhaltiConfirm, db: DbSession, background: BackgroundTasks) -> PaymentResult:
    order = db.scalar(select(Order).where(Order.payment_reference == body.pidx, Order.payment_method == "Khalti"))
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found for this payment")
    if order.payment_status == "Paid":
        return PaymentResult(order_id=order.id, paid=True, detail="Payment received. Thank you!")
    try:
        gateway = payments.khalti_lookup(body.pidx)
    except payments.GatewayError:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Couldn't confirm with Khalti. Please refresh in a minute.") from None
    return _settle(db, order, gateway, background)
