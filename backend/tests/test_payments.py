import base64
import json
from decimal import Decimal

import httpx
import pytest

from app import payments
from app.config import get_settings
from app.models import Order
from tests.conftest import auth_header

SHIPPING = {
    "delivery_zone": "inside_valley",
    "shipping_name": "Sita Sharma",
    "phone": "9841234567",
    "shipping_address": "Ward 4, Baneshwor",
    "city": "Kathmandu",
    "items": [{"product_id": 1, "quantity": 1}],  # Rs. 4,500
}


class FakeGateway:
    """Stands in for eSewa and Khalti; records every call."""

    def __init__(self):
        self.calls: list[httpx.Request] = []
        self.esewa_status = {"status": "COMPLETE", "total_amount": 4500.0, "ref_id": "0001TS9"}
        self.khalti_lookup = {"status": "Completed", "total_amount": 450000, "transaction_id": "T1"}

    def handler(self, request: httpx.Request) -> httpx.Response:
        self.calls.append(request)
        path = request.url.path
        if path == "/api/epay/transaction/status/":
            return httpx.Response(200, json=self.esewa_status)
        if path == "/api/v2/epayment/initiate/":
            body = json.loads(request.content)
            return httpx.Response(200, json={
                "pidx": f"PIDX{body['purchase_order_id']}abc",
                "payment_url": f"https://test-pay.khalti.com/?pidx=PIDX{body['purchase_order_id']}abc",
                "expires_at": "2026-09-28T16:26:16+05:45", "expires_in": 1800,
            })
        if path == "/api/v2/epayment/lookup/":
            return httpx.Response(200, json={"pidx": json.loads(request.content)["pidx"], "fee": 0,
                                             "refunded": False, **self.khalti_lookup})
        return httpx.Response(404)


@pytest.fixture()
def gateway(monkeypatch):
    fake = FakeGateway()
    monkeypatch.setattr(payments, "_transport", httpx.MockTransport(fake.handler))
    s = get_settings()
    monkeypatch.setattr(s, "payments_env", "test")
    monkeypatch.setattr(s, "khalti_secret_key", "test_secret_key_abc")
    monkeypatch.setattr(s, "frontend_url", "https://shop.example.com")
    return fake


def customer(client):
    r = client.post("/api/auth/register", json={"full_name": "Sita", "email": "sita@example.com", "password": "strongpass1"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def place(client, headers, method):
    r = client.post("/api/orders", headers=headers, json={**SHIPPING, "payment_method": method})
    assert r.status_code == 201, r.text
    return r.json()["id"]


def esewa_response(fields: dict, key: str = payments.ESEWA_TEST_SECRET_KEY) -> str:
    names = "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names"
    body = {**fields, "signed_field_names": names}
    body["signature"] = payments.esewa_sign(",".join(f"{n}={body[n]}" for n in names.split(",")), key)
    return base64.b64encode(json.dumps(body).encode()).decode()


# --- Signing ------------------------------------------------------------------------


def test_esewa_signature_matches_documented_format():
    # base64(HMAC-SHA256(secret, "total_amount=..,transaction_uuid=..,product_code=..")), as in the eSewa ePay v2 docs.
    action, f = payments.esewa_form(Decimal("4600"), "PN-7-abc", "https://s/ok", "https://s/fail")
    assert action == "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
    assert f["total_amount"] == "4600.00" and f["product_code"] == "EPAYTEST"
    assert f["signed_field_names"] == "total_amount,transaction_uuid,product_code"
    import hashlib
    import hmac
    expected = base64.b64encode(hmac.new(b"8gBm/:&EnhH.1/q", b"total_amount=4600.00,transaction_uuid=PN-7-abc,product_code=EPAYTEST",
                                         hashlib.sha256).digest()).decode()
    assert f["signature"] == expected


def test_esewa_response_keeps_numbers_as_sent():
    # eSewa signs the literal text, e.g. "1,000.0"; re-formatting it would break the check.
    raw = {"transaction_code": "X1", "status": "COMPLETE", "total_amount": "1,000.0",
           "transaction_uuid": "PN-1-a", "product_code": "EPAYTEST"}
    assert payments.esewa_decode_response(esewa_response(raw))["total_amount"] == "1,000.0"
    numeric = dict(raw, total_amount=100.0)
    assert payments.esewa_decode_response(esewa_response(numeric))["total_amount"] == "100.0"


# --- eSewa flow -------------------------------------------------------------------------


def test_esewa_pay_and_confirm(client, db_session, gateway):
    headers = customer(client)
    order_id = place(client, headers, "eSewa")

    start = client.post(f"/api/payments/orders/{order_id}/start", headers=headers).json()
    assert start["gateway"] == "esewa"
    fields = start["form_fields"]
    assert fields["success_url"] == "https://shop.example.com/payment/esewa"
    assert fields["failure_url"] == f"https://shop.example.com/payment/esewa/failed/{order_id}"
    assert fields["total_amount"] == "4500.00"  # delivery fees are 0 unless configured
    uuid = fields["transaction_uuid"]

    data = esewa_response({"transaction_code": "000AE01", "status": "COMPLETE", "total_amount": "4,500.0",
                           "transaction_uuid": uuid, "product_code": "EPAYTEST"})
    r = client.post("/api/payments/esewa/confirm", json={"data": data})
    assert r.status_code == 200 and r.json() == {"order_id": order_id, "paid": True, "detail": "Payment received. Thank you!"}

    status_call = gateway.calls[-1]
    assert status_call.url.params["transaction_uuid"] == uuid  # confirmed server-to-server
    with db_session() as s:
        o = s.get(Order, order_id)
        assert (o.payment_status, o.status) == ("Paid", "Paid") and o.paid_at is not None

    again = client.post("/api/payments/esewa/confirm", json={"data": data})
    assert again.json()["paid"] is True
    assert client.post(f"/api/payments/orders/{order_id}/start", headers=headers).status_code == 409


def test_esewa_forged_or_unpaid_is_rejected(client, db_session, gateway):
    headers = customer(client)
    order_id = place(client, headers, "eSewa")
    uuid = client.post(f"/api/payments/orders/{order_id}/start", headers=headers).json()["form_fields"]["transaction_uuid"]
    fields = {"transaction_code": "X", "status": "COMPLETE", "total_amount": "4500.0",
              "transaction_uuid": uuid, "product_code": "EPAYTEST"}

    forged = esewa_response(fields, key="not-the-secret")
    assert client.post("/api/payments/esewa/confirm", json={"data": forged}).status_code == 400
    assert client.post("/api/payments/esewa/confirm", json={"data": "bm90IGpzb24gYXQgYWxs"}).status_code == 400

    # Valid signature, but eSewa's own status API says it isn't paid.
    gateway.esewa_status = {"status": "PENDING", "total_amount": 4500.0}
    r = client.post("/api/payments/esewa/confirm", json={"data": esewa_response(fields)})
    assert r.json()["paid"] is False
    gateway.esewa_status = {"status": "COMPLETE", "total_amount": 1.0}  # wrong amount
    assert client.post("/api/payments/esewa/confirm", json={"data": esewa_response(fields)}).status_code == 409
    with db_session() as s:
        assert s.get(Order, order_id).payment_status == "Initiated"


# --- Khalti flow ----------------------------------------------------------------------


def test_khalti_pay_and_confirm(client, db_session, gateway):
    headers = customer(client)
    order_id = place(client, headers, "Khalti")
    start = client.post(f"/api/payments/orders/{order_id}/start", headers=headers).json()
    assert start == {"gateway": "khalti", "redirect_url": f"https://test-pay.khalti.com/?pidx=PIDX{order_id}abc",
                     "form_action": None, "form_fields": None}

    init = gateway.calls[0]
    assert init.url == "https://dev.khalti.com/api/v2/epayment/initiate/"
    assert init.headers["authorization"] == "Key test_secret_key_abc"
    sent = json.loads(init.content)
    assert sent["amount"] == 450000 and sent["purchase_order_id"] == str(order_id)  # paisa
    assert sent["return_url"] == "https://shop.example.com/payment/khalti"

    r = client.post("/api/payments/khalti/confirm", json={"pidx": f"PIDX{order_id}abc"})
    assert r.json()["paid"] is True
    with db_session() as s:
        assert s.get(Order, order_id).payment_status == "Paid"


def test_khalti_cancel_marks_failed_and_retry_allowed(client, db_session, gateway):
    headers = customer(client)
    order_id = place(client, headers, "Khalti")
    client.post(f"/api/payments/orders/{order_id}/start", headers=headers)
    gateway.khalti_lookup = {"status": "User canceled", "total_amount": 450000, "transaction_id": None}
    r = client.post("/api/payments/khalti/confirm", json={"pidx": f"PIDX{order_id}abc"})
    assert r.json()["paid"] is False
    with db_session() as s:
        assert s.get(Order, order_id).payment_status == "Failed"
    assert client.post(f"/api/payments/orders/{order_id}/start", headers=headers).status_code == 200


def test_khalti_amount_mismatch_and_unknown_pidx(client, gateway):
    headers = customer(client)
    order_id = place(client, headers, "Khalti")
    client.post(f"/api/payments/orders/{order_id}/start", headers=headers)
    gateway.khalti_lookup = {"status": "Completed", "total_amount": 1000, "transaction_id": "T"}
    assert client.post("/api/payments/khalti/confirm", json={"pidx": f"PIDX{order_id}abc"}).status_code == 409
    assert client.post("/api/payments/khalti/confirm", json={"pidx": "NOPE123"}).status_code == 404


# --- Guards ---------------------------------------------------------------------------


def test_start_payment_guards(client, gateway, monkeypatch):
    headers = customer(client)
    cod = place(client, headers, "COD")
    assert client.post(f"/api/payments/orders/{cod}/start", headers=headers).status_code == 409

    khalti = place(client, headers, "Khalti")
    other = client.post("/api/auth/register", json={"full_name": "Ram", "email": "ram@example.com",
                                                     "password": "strongpass1"}).json()["access_token"]
    assert client.post(f"/api/payments/orders/{khalti}/start",
                       headers={"Authorization": f"Bearer {other}"}).status_code == 404

    monkeypatch.setattr(get_settings(), "khalti_secret_key", "")
    assert client.post(f"/api/payments/orders/{khalti}/start", headers=headers).status_code == 409
    assert client.get("/api/payments/methods").json() == {"esewa": True, "khalti": False, "test_mode": True}

    monkeypatch.setattr(get_settings(), "payments_env", "live")  # live needs real eSewa keys
    assert client.get("/api/payments/methods").json()["esewa"] is False


def test_gateway_down_gives_clear_error(client, monkeypatch, gateway):
    def boom(request):
        raise httpx.ConnectError("down")

    monkeypatch.setattr(payments, "_transport", httpx.MockTransport(boom))
    headers = customer(client)
    order_id = place(client, headers, "Khalti")
    r = client.post(f"/api/payments/orders/{order_id}/start", headers=headers)
    assert r.status_code == 502 and "didn't respond" in r.json()["detail"]
