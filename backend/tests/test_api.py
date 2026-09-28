from app.models import Product
from tests.conftest import auth_header

CUSTOMER = {"full_name": "Sita Sharma", "email": "Sita@Example.com", "password": "strongpass1"}
SHIPPING = {
    "payment_method": "COD",
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
