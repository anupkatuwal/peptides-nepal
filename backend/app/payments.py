"""eSewa ePay v2 and Khalti KPG-2 clients.

Only the server talks to the gateways' verification APIs. A redirect back
from a gateway is never trusted on its own: every payment is confirmed with
a server-to-server status call and the amount is checked against the order.
"""

import base64
import binascii
import hashlib
import hmac
import json
import secrets
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

import httpx

from .config import get_settings

# eSewa's public sandbox merchant, published in its developer docs.
ESEWA_TEST_PRODUCT_CODE = "EPAYTEST"
ESEWA_TEST_SECRET_KEY = "8gBm/:&EnhH.1/q"

_ESEWA_BASE = {"test": "https://rc-epay.esewa.com.np", "live": "https://epay.esewa.com.np"}
_KHALTI_BASE = {"test": "https://dev.khalti.com/api/v2", "live": "https://khalti.com/api/v2"}

# Tests swap this for httpx.MockTransport.
_transport: httpx.BaseTransport | None = None


class GatewayError(Exception):
    """The gateway could not be reached or returned something unusable."""


def _client() -> httpx.Client:
    return httpx.Client(timeout=15, transport=_transport)


def money(value: Decimal) -> str:
    return f"{value.quantize(Decimal('0.01'))}"


def _to_decimal(value: object) -> Decimal | None:
    try:
        return Decimal(str(value).replace(",", ""))
    except InvalidOperation:
        return None


# --- eSewa --------------------------------------------------------------------


def esewa_credentials() -> tuple[str, str] | None:
    s = get_settings()
    if s.esewa_product_code and s.esewa_secret_key:
        return s.esewa_product_code, s.esewa_secret_key
    if s.payments_env == "test":
        return ESEWA_TEST_PRODUCT_CODE, ESEWA_TEST_SECRET_KEY
    return None


def esewa_sign(message: str, secret_key: str) -> str:
    digest = hmac.new(secret_key.encode("utf-8"), message.encode("utf-8"), hashlib.sha256).digest()
    return base64.b64encode(digest).decode("ascii")


def new_transaction_uuid(order_id: int) -> str:
    # eSewa allows letters, numbers and hyphens. A new one per attempt.
    return f"PN-{order_id}-{secrets.token_hex(6)}"


def esewa_form(total: Decimal, transaction_uuid: str, success_url: str, failure_url: str) -> tuple[str, dict[str, str]]:
    creds = esewa_credentials()
    if creds is None:
        raise GatewayError("eSewa is not configured")
    product_code, secret_key = creds
    total_amount = money(total)
    signed = "total_amount,transaction_uuid,product_code"
    fields = {
        "amount": total_amount,
        "tax_amount": "0",
        "total_amount": total_amount,
        "transaction_uuid": transaction_uuid,
        "product_code": product_code,
        "product_service_charge": "0",
        "product_delivery_charge": "0",
        "success_url": success_url,
        "failure_url": failure_url,
        "signed_field_names": signed,
        "signature": esewa_sign(
            f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code={product_code}", secret_key
        ),
    }
    action = f"{_ESEWA_BASE[get_settings().payments_env]}/api/epay/main/v2/form"
    return action, fields


def esewa_decode_response(data: str) -> dict[str, str]:
    """Decode and verify the signed `data` eSewa appends to the success URL.

    Numbers are kept as their original text, because the signature covers the
    exact characters eSewa sent (e.g. "1,000.0").
    """
    creds = esewa_credentials()
    if creds is None:
        raise GatewayError("eSewa is not configured")
    product_code, secret_key = creds
    try:
        raw = base64.b64decode(data, validate=True)
        payload = json.loads(raw, parse_float=str, parse_int=str)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("Malformed eSewa response") from exc
    if not isinstance(payload, dict):
        raise ValueError("Malformed eSewa response")

    names = str(payload.get("signed_field_names", "")).split(",")
    if not names or any(n not in payload for n in names):
        raise ValueError("eSewa response is missing signed fields")
    message = ",".join(f"{n}={payload[n]}" for n in names)
    if not hmac.compare_digest(esewa_sign(message, secret_key), str(payload.get("signature", ""))):
        raise ValueError("eSewa signature does not match")
    if payload.get("product_code") != product_code:
        raise ValueError("eSewa response is for another merchant")
    return {k: str(v) for k, v in payload.items()}


@dataclass
class GatewayStatus:
    paid: bool
    final_failure: bool  # the attempt is over and didn't pay (cancelled/expired/not found)
    raw_status: str
    amount: Decimal | None


def esewa_status(transaction_uuid: str, total: Decimal) -> GatewayStatus:
    creds = esewa_credentials()
    if creds is None:
        raise GatewayError("eSewa is not configured")
    product_code, _ = creds
    url = f"{_ESEWA_BASE[get_settings().payments_env]}/api/epay/transaction/status/"
    params = {"product_code": product_code, "total_amount": money(total), "transaction_uuid": transaction_uuid}
    try:
        with _client() as c:
            r = c.get(url, params=params)
        body = r.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise GatewayError("Could not reach eSewa") from exc
    status = str(body.get("status", "")).upper()
    return GatewayStatus(
        paid=status == "COMPLETE",
        final_failure=status in {"NOT_FOUND", "CANCELED", "FULL_REFUND"},
        raw_status=status or f"HTTP {r.status_code}",
        amount=_to_decimal(body.get("total_amount")) if body.get("total_amount") is not None else None,
    )


# --- Khalti -------------------------------------------------------------------


def khalti_enabled() -> bool:
    return bool(get_settings().khalti_secret_key)


def _khalti_headers() -> dict[str, str]:
    return {"Authorization": f"Key {get_settings().khalti_secret_key}", "Content-Type": "application/json"}


def paisa(value: Decimal) -> int:
    return int((value * 100).quantize(Decimal("1")))


def khalti_initiate(
    order_id: int, total: Decimal, return_url: str, website_url: str, name: str, email: str, phone: str
) -> tuple[str, str]:
    """Returns (pidx, payment_url)."""
    if not khalti_enabled():
        raise GatewayError("Khalti is not configured")
    body = {
        "return_url": return_url,
        "website_url": website_url,
        "amount": paisa(total),
        "purchase_order_id": str(order_id),
        "purchase_order_name": f"Peptides Nepal order #{order_id}",
        "customer_info": {"name": name, "email": email, "phone": phone},
    }
    try:
        with _client() as c:
            r = c.post(f"{_KHALTI_BASE[get_settings().payments_env]}/epayment/initiate/", json=body, headers=_khalti_headers())
        data = r.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise GatewayError("Could not reach Khalti") from exc
    if r.status_code != 200 or "pidx" not in data or "payment_url" not in data:
        raise GatewayError(f"Khalti refused the payment request: {data}")
    return str(data["pidx"]), str(data["payment_url"])


def khalti_lookup(pidx: str) -> GatewayStatus:
    if not khalti_enabled():
        raise GatewayError("Khalti is not configured")
    try:
        with _client() as c:
            r = c.post(
                f"{_KHALTI_BASE[get_settings().payments_env]}/epayment/lookup/", json={"pidx": pidx}, headers=_khalti_headers()
            )
        data = r.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise GatewayError("Could not reach Khalti") from exc
    status = str(data.get("status", ""))
    amount = data.get("total_amount")
    return GatewayStatus(
        paid=status == "Completed",
        final_failure=status in {"User canceled", "Expired"},
        raw_status=status or f"HTTP {r.status_code}",
        # Khalti reports paisa.
        amount=(d / 100) if amount is not None and (d := _to_decimal(amount)) is not None else None,
    )
