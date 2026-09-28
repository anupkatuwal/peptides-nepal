from decimal import Decimal

import pytest

from app.config import get_settings
from app.models import Product
from tests.conftest import auth_header

CUSTOMER = {"full_name": "Sita Sharma", "email": "Sita@Example.com", "password": "strongpass1"}
SHIPPING = {
    "payment_method": "COD",
    "delivery_zone": "inside_valley",
    "shipping_name": "Sita Sharma",
    "phone": "98-4123 4567",
    "shipping_address": "Ward 4, Baneshwor",
    "city": "Kathmandu",
}


def register(client):
    r = client.post("/api/auth/register", json=CUSTOMER)
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


# --- Auth ---------------------------------------------------------------------


def test_register_login_me(client):
    r = client.post("/api/auth/register", json=CUSTOMER)
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["email"] == "sita@example.com"
    assert body["user"]["role"] == "Customer"

    assert client.post("/api/auth/register", json=CUSTOMER).status_code == 409

    headers = auth_header(client, "SITA@example.com", "strongpass1")
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200 and me.json()["full_name"] == "Sita Sharma"


def test_register_cannot_set_role_or_weak_password(client):
    assert client.post("/api/auth/register", json={**CUSTOMER, "role": "Admin"}).status_code == 422
    assert client.post("/api/auth/register", json={**CUSTOMER, "password": "short"}).status_code == 422
    assert client.post("/api/auth/register", json={**CUSTOMER, "password": "onlyletters"}).status_code == 422
    assert client.post("/api/auth/register", json={**CUSTOMER, "email": "not-an-email"}).status_code == 422


def test_login_failures(client):
    register(client)
    assert client.post("/api/auth/login", json={"email": "sita@example.com", "password": "wrongpass1"}).status_code == 401
    assert client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "whatever1"}).status_code == 401


def test_bad_tokens_rejected(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers={"Authorization": "Bearer abc.def.ghi"}).status_code == 401


# --- Catalogue ----------------------------------------------------------------


def test_categories_count_active_products(client):
    r = client.get("/api/categories")
    assert r.status_code == 200
    counts = {c["slug"]: c["product_count"] for c in r.json()}
    assert counts == {"recovery": 1, "fitness": 1}


def test_product_listing_filters(client):
    all_items = client.get("/api/products").json()
    assert all_items["total"] == 2
    assert {p["slug"] for p in all_items["items"]} == {"bpc-157-5mg", "cjc-ipa"}

    fitness = client.get("/api/products", params={"category": "fitness"}).json()
    assert [p["slug"] for p in fitness["items"]] == ["cjc-ipa"]

    search = client.get("/api/products", params={"q": "bpc"}).json()
    assert [p["slug"] for p in search["items"]] == ["bpc-157-5mg"]

    # Wildcards in the search are literal, not SQL patterns.
    assert client.get("/api/products", params={"q": "%"}).json()["total"] == 0

    cheap_first = client.get("/api/products", params={"sort": "price_asc"}).json()
    assert [p["price"] for p in cheap_first["items"]] == [4500.0, 7500.0]

    assert client.get("/api/products", params={"category": "Robert'); DROP TABLE"}).status_code == 422


def test_product_detail(client):
    r = client.get("/api/products/bpc-157-5mg")
    assert r.status_code == 200
    p = r.json()
    assert p["purity_percentage"] == 99.1
    assert p["category"]["slug"] == "recovery"
    assert client.get("/api/products/hidden").status_code == 404


# --- Orders -------------------------------------------------------------------


def test_order_uses_server_prices_and_takes_stock(client, db_session):
    headers = register(client)
    r = client.post(
        "/api/orders",
        headers=headers,
        json={**SHIPPING, "items": [{"product_id": 1, "quantity": 1}, {"product_id": 1, "quantity": 1},
                                    {"product_id": 2, "quantity": 1}]},
    )
    assert r.status_code == 201, r.text
    order = r.json()
    assert order["total_price"] == 4500 * 2 + 7500
    assert order["status"] == "Pending"
    assert order["phone"] == "9841234567"
    assert {i["product_slug"]: i["quantity"] for i in order["items"]} == {"bpc-157-5mg": 2, "cjc-ipa": 1}

    with db_session() as s:
        assert s.get(Product, 1).stock_level == 1

    mine = client.get("/api/orders/me", headers=headers).json()
    assert [o["id"] for o in mine] == [order["id"]]


def test_order_rejects_price_field_and_overselling(client, db_session):
    headers = register(client)
    sneaky = {**SHIPPING, "items": [{"product_id": 1, "quantity": 1, "unit_price": 1}]}
    assert client.post("/api/orders", headers=headers, json=sneaky).status_code == 422

    too_many = {**SHIPPING, "items": [{"product_id": 2, "quantity": 1}, {"product_id": 1, "quantity": 4}]}
    r = client.post("/api/orders", headers=headers, json=too_many)
    assert r.status_code == 409
    with db_session() as s:  # nothing was taken, not even the in-stock line
        assert s.get(Product, 1).stock_level == 3
        assert s.get(Product, 2).stock_level == 10

    hidden = {**SHIPPING, "items": [{"product_id": 3, "quantity": 1}]}
    assert client.post("/api/orders", headers=headers, json=hidden).status_code == 422


def test_order_requires_login_and_is_private(client):
    assert client.post("/api/orders", json={**SHIPPING, "items": [{"product_id": 1, "quantity": 1}]}).status_code == 401
    headers = register(client)
    order_id = client.post("/api/orders", headers=headers,
                           json={**SHIPPING, "items": [{"product_id": 1, "quantity": 1}]}).json()["id"]
    other = client.post("/api/auth/register", json={**CUSTOMER, "email": "ram@example.com"}).json()["access_token"]
    assert client.get(f"/api/orders/{order_id}", headers={"Authorization": f"Bearer {other}"}).status_code == 404
    assert client.get(f"/api/orders/{order_id}", headers=headers).status_code == 200


def test_admin_cancel_returns_stock(client, db_session):
    headers = register(client)
    order_id = client.post("/api/orders", headers=headers,
                           json={**SHIPPING, "items": [{"product_id": 1, "quantity": 2}]}).json()["id"]
    assert client.patch(f"/api/orders/{order_id}/status", headers=headers, json={"status": "Cancelled"}).status_code == 403

    admin = auth_header(client, "admin@example.com", "adminpass1")
    r = client.patch(f"/api/orders/{order_id}/status", headers=admin, json={"status": "Cancelled"})
    assert r.status_code == 200 and r.json()["status"] == "Cancelled"
    with db_session() as s:
        assert s.get(Product, 1).stock_level == 3


def test_admin_product_crud(client):
    admin = auth_header(client, "admin@example.com", "adminpass1")
    new = {"category_id": 1, "name": "TB-500 (5 mg)", "slug": "tb-500-5mg", "description": "Thymosin beta-4 fragment.",
           "price": "5500.00", "stock_level": 5}
    r = client.post("/api/products", headers=admin, json=new)
    assert r.status_code == 201, r.text
    pid = r.json()["id"]
    assert client.post("/api/products", headers=admin, json=new).status_code == 409

    r = client.patch(f"/api/products/{pid}", headers=admin,
                     json={"purity_percentage": "98.75", "coa_image_url": "https://lab.example.com/coa.png"})
    assert r.status_code == 200 and r.json()["purity_percentage"] == 98.75

    bad_url = client.patch(f"/api/products/{pid}", headers=admin, json={"coa_image_url": "javascript:alert(1)"})
    assert bad_url.status_code == 422
    for bad in ["//evil.example/coa.png", "http://evil.example/coa.png", "https://"]:
        assert client.patch(f"/api/products/{pid}", headers=admin, json={"coa_image_url": bad}).status_code == 422
    assert client.patch(f"/api/products/{pid}", headers=admin, json={"name": None}).status_code == 422
    cleared = client.patch(f"/api/products/{pid}", headers=admin, json={"purity_percentage": None})
    assert cleared.status_code == 200 and cleared.json()["purity_percentage"] is None


# --- Contact ------------------------------------------------------------------

MESSAGE = {
    "sender_name": "Hari",
    "sender_email": "hari@example.com",
    "subject": "Shipping to Pokhara",
    "message_body": "Hello, do you deliver to Pokhara and how long does it take?",
}


def test_contact_validation_and_storage(client):
    assert client.post("/api/contact", json=MESSAGE).status_code == 202
    assert client.post("/api/contact", json={**MESSAGE, "sender_email": "nope"}).status_code == 422
    assert client.post("/api/contact", json={**MESSAGE, "message_body": "too short"}).status_code == 422
    assert client.post("/api/contact", json={**MESSAGE, "message_body": "x" * 4001}).status_code == 422
    # Honeypot: accepted but not stored.
    assert client.post("/api/contact", json={**MESSAGE, "website": "http://spam"}).status_code == 202

    admin = auth_header(client, "admin@example.com", "adminpass1")
    inbox = client.get("/api/contact", headers=admin).json()
    assert len(inbox) == 1 and inbox[0]["is_read"] is False
    assert client.patch(f"/api/contact/{inbox[0]['id']}/read", headers=admin).json()["is_read"] is True
    assert client.get("/api/contact").status_code == 401


def test_contact_rate_limited(client, rate_limited):
    codes = [client.post("/api/contact", json=MESSAGE).status_code for _ in range(4)]
    assert codes == [202, 202, 202, 429]


def test_login_rate_limited(client, rate_limited):
    bad = {"email": "admin@example.com", "password": "wrongpass1"}
    codes = [client.post("/api/auth/login", json=bad).status_code for _ in range(11)]
    assert codes[:10] == [401] * 10 and codes[10] == 429


# --- HTTP ---------------------------------------------------------------------


def test_cors_only_allows_frontend(client):
    ok = client.options("/api/products", headers={"Origin": "https://shop.example.com",
                                                  "Access-Control-Request-Method": "GET"})
    assert ok.headers.get("access-control-allow-origin") == "https://shop.example.com"
    evil = client.options("/api/products", headers={"Origin": "https://evil.example",
                                                    "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in evil.headers


def test_security_headers(client):
    r = client.get("/api/categories")
    assert r.headers["x-content-type-options"] == "nosniff"
    assert r.headers["x-frame-options"] == "DENY"


# --- Media --------------------------------------------------------------------

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
PDF = b"%PDF-1.7\n" + b"0" * 64


def test_media_upload_and_download(client):
    admin = auth_header(client, "admin@example.com", "adminpass1")
    r = client.post("/api/media", headers=admin, files={"file": ("../../evil name.png", PNG, "text/html")})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["content_type"] == "image/png"  # from the bytes, not the claimed type
    assert body["file_name"] == "evil-name.png"
    assert body["url"].endswith(f"/api/media/{body['id']}/evil-name.png")
    assert client.get(body["url"].replace("http://testserver", "")).content == PNG

    again = client.post("/api/media", headers=admin, files={"file": ("copy.png", PNG, "image/png")})
    assert again.json()["id"] == body["id"]  # same bytes, same row

    got = client.get(f"/api/media/{body['id']}")
    assert got.status_code == 200 and got.content == PNG
    assert got.headers["content-type"] == "image/png"
    assert "sandbox" in got.headers["content-security-policy"]
    assert "immutable" in got.headers["cache-control"]

    pdf = client.post("/api/media", headers=admin, files={"file": ("coa.pdf", PDF, "application/pdf")})
    assert pdf.json()["content_type"] == "application/pdf"
    assert pdf.json()["url"].endswith("/coa.pdf")
    disguised = client.post("/api/media", headers=admin, files={"file": ("report.png", PDF + b"x", "image/png")})
    assert disguised.json()["url"].endswith("/report.pdf")


def test_media_rejects_bad_files_and_non_admins(client):
    admin = auth_header(client, "admin@example.com", "adminpass1")
    html = client.post("/api/media", headers=admin, files={"file": ("x.png", b"<script>alert(1)</script>", "image/png")})
    assert html.status_code == 415
    svg = client.post("/api/media", headers=admin, files={"file": ("x.svg", b"<svg onload=alert(1)>", "image/svg+xml")})
    assert svg.status_code == 415

    customer = client.post("/api/auth/register", json={"full_name": "Ram", "email": "ram@example.com",
                                                        "password": "strongpass1"}).json()["access_token"]
    denied = client.post("/api/media", headers={"Authorization": f"Bearer {customer}"}, files={"file": ("a.png", PNG)})
    assert denied.status_code == 403
    assert client.post("/api/media", files={"file": ("a.png", PNG)}).status_code == 401
    assert client.get("/api/media/999").status_code == 404


def test_oversized_bodies_rejected(client):
    big = {"sender_name": "Hari", "sender_email": "h@example.com", "subject": "Hello", "message_body": "x" * (1024 * 1024 + 10)}
    assert client.post("/api/contact", json=big).status_code == 413


def test_errors_still_carry_cors_headers(client):
    big = {"sender_name": "Hari", "sender_email": "h@example.com", "subject": "Hello", "message_body": "x" * (1024 * 1024 + 10)}
    r = client.post("/api/contact", json=big, headers={"Origin": "https://shop.example.com"})
    assert r.status_code == 413
    assert r.headers.get("access-control-allow-origin") == "https://shop.example.com"


# --- Delivery & admin -----------------------------------------------------------


@pytest.fixture()
def delivery_fees():
    s = get_settings()
    old = (s.delivery_fee_inside_valley, s.delivery_fee_outside_valley, s.free_delivery_threshold)
    s.delivery_fee_inside_valley, s.delivery_fee_outside_valley, s.free_delivery_threshold = (
        Decimal("100"), Decimal("250"), Decimal("10000"))
    yield
    s.delivery_fee_inside_valley, s.delivery_fee_outside_valley, s.free_delivery_threshold = old


def test_delivery_fee_added_by_zone_and_waived_over_threshold(client, delivery_fees):
    opts = client.get("/api/orders/delivery-options").json()
    assert {o["zone"]: o["fee"] for o in opts["options"]} == {"inside_valley": 100, "outside_valley": 250}
    assert opts["free_delivery_threshold"] == 10000

    headers = register(client)
    one = {**SHIPPING, "delivery_zone": "outside_valley", "items": [{"product_id": 1, "quantity": 1}]}
    r = client.post("/api/orders", headers=headers, json=one).json()
    assert (r["delivery_fee"], r["total_price"]) == (250, 4750)

    big = {**SHIPPING, "items": [{"product_id": 2, "quantity": 2}]}  # 15,000 >= 10,000
    r = client.post("/api/orders", headers=headers, json=big).json()
    assert (r["delivery_fee"], r["total_price"]) == (0, 15000)

    assert client.post("/api/orders", headers=headers, json={**one, "delivery_zone": "moon"}).status_code == 422


def test_admin_summary_and_product_list(client):
    headers = register(client)
    client.post("/api/orders", headers=headers, json={**SHIPPING, "items": [{"product_id": 1, "quantity": 1}]})
    client.post("/api/contact", json=MESSAGE)

    admin = auth_header(client, "admin@example.com", "adminpass1")
    s = client.get("/api/admin/summary", headers=admin).json()
    assert s["orders_by_status"] == {"Pending": 1}
    assert s["revenue_30d"] == 4500 and s["orders_30d"] == 1
    assert s["unread_messages"] == 1
    assert [p["slug"] for p in s["low_stock"]] == ["bpc-157-5mg"]  # 2 left
    assert s["missing_lab_results"] == 2

    products = client.get("/api/admin/products", headers=admin).json()
    assert {p["slug"]: p["is_active"] for p in products}["hidden"] is False

    orders = client.get("/api/orders", headers=admin).json()
    assert orders[0]["customer_email"] == "sita@example.com"

    assert client.get("/api/admin/summary", headers=headers).status_code == 403


# --- Email & password reset -------------------------------------------------------


@pytest.fixture()
def outbox(monkeypatch):
    sent: list[dict] = []

    def fake_send(to, subject, text, html=None, reply_to=None):
        sent.append({"to": to, "subject": subject, "text": text, "html": html, "reply_to": reply_to})
        return True

    monkeypatch.setattr("app.email.send_email", fake_send)
    s = get_settings()
    monkeypatch.setattr(s, "shop_notify_email", "shop@example.com")
    monkeypatch.setattr(s, "frontend_url", "https://shop.example.com")
    return sent


def test_order_emails_customer_and_shop(client, outbox):
    headers = register(client)
    notes = "<script>alert(1)</script> gate is blue"
    order = client.post("/api/orders", headers=headers,
                        json={**SHIPPING, "notes": notes, "items": [{"product_id": 1, "quantity": 1}]}).json()
    to = {m["to"]: m for m in outbox}
    assert set(to) == {"sita@example.com", "shop@example.com"}
    assert f"#{order['id']}" in to["sita@example.com"]["subject"]
    assert "BPC-157 (5 mg) x 1" in to["sita@example.com"]["text"]
    assert to["shop@example.com"]["reply_to"] == "sita@example.com"
    assert "<script>" not in to["shop@example.com"]["html"] and "&lt;script&gt;" in to["shop@example.com"]["html"]

    admin = auth_header(client, "admin@example.com", "adminpass1")
    outbox.clear()
    client.patch(f"/api/orders/{order['id']}/status", headers=admin, json={"status": "Shipped"})
    assert [m["subject"] for m in outbox] == [f"Order #{order['id']} shipped — Peptides Nepal"]
    outbox.clear()
    client.patch(f"/api/orders/{order['id']}/status", headers=admin, json={"status": "Shipped"})
    assert outbox == []  # no change, no email


def test_contact_alert_email(client, outbox):
    client.post("/api/contact", json=MESSAGE)
    assert len(outbox) == 1
    assert outbox[0]["to"] == "shop@example.com" and outbox[0]["reply_to"] == "hari@example.com"
    client.post("/api/contact", json={**MESSAGE, "website": "spam"})
    assert len(outbox) == 1  # honeypot: nothing sent


def _token_from(mail: dict) -> str:
    link = next(w for w in mail["text"].split() if w.startswith("https://shop.example.com/reset-password?token="))
    return link.split("token=", 1)[1]


def test_password_reset_flow(client, outbox, db_session):
    old_session = register(client)
    unknown = client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    known = client.post("/api/auth/forgot-password", json={"email": "SITA@example.com"})
    assert unknown.status_code == known.status_code == 202
    assert unknown.json() == known.json()  # can't tell which emails have accounts
    assert [m["to"] for m in outbox] == ["sita@example.com"]
    first = _token_from(outbox[0])

    client.post("/api/auth/forgot-password", json={"email": "sita@example.com"})
    second = _token_from(outbox[1])
    assert client.post("/api/auth/reset-password", json={"token": first, "password": "newpass123"}).status_code == 400

    weak = client.post("/api/auth/reset-password", json={"token": second, "password": "short"})
    assert weak.status_code == 422
    ok = client.post("/api/auth/reset-password", json={"token": second, "password": "newpass123"})
    assert ok.status_code == 200
    assert client.post("/api/auth/reset-password", json={"token": second, "password": "another123"}).status_code == 400

    assert client.get("/api/auth/me", headers=old_session).status_code == 401  # old sessions signed out
    assert client.post("/api/auth/login", json={"email": "sita@example.com", "password": "strongpass1"}).status_code == 401
    fresh = auth_header(client, "sita@example.com", "newpass123")
    assert client.get("/api/auth/me", headers=fresh).status_code == 200


def test_expired_reset_token_rejected(client, outbox, db_session):
    from datetime import timedelta

    from app.models import PasswordResetToken, utcnow

    register(client)
    client.post("/api/auth/forgot-password", json={"email": "sita@example.com"})
    token = _token_from(outbox[0])
    with db_session() as s:
        for t in s.query(PasswordResetToken).all():
            t.expires_at = utcnow() - timedelta(minutes=1)
        s.commit()
    assert client.post("/api/auth/reset-password", json={"token": token, "password": "newpass123"}).status_code == 400
