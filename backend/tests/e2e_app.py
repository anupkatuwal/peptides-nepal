"""The real API, with eSewa/Khalti server-to-server calls answered by fakes.

For the Playwright tests only (frontend/e2e). Never deploy this:
    KHALTI_SECRET_KEY=fake uvicorn tests.e2e_app:app --port 8000
The browser side of each gateway is faked inside the Playwright tests.
"""
import json
import httpx
from app import payments
from app.main import app  # noqa: F401  (re-exported for uvicorn)

_khalti = {}

def handler(request: httpx.Request) -> httpx.Response:
    path = request.url.path
    if path == "/api/epay/transaction/status/":
        return httpx.Response(200, json={"status": "COMPLETE", "total_amount": float(request.url.params["total_amount"]),
                                         "ref_id": "FAKE-REF", "product_code": request.url.params["product_code"]})
    if path == "/api/v2/epayment/initiate/":
        body = json.loads(request.content)
        pidx = f"FAKEPIDX{body['purchase_order_id']}"
        _khalti[pidx] = (body["amount"], body["return_url"])
        return httpx.Response(200, json={"pidx": pidx, "payment_url": f"https://test-pay.khalti.com/?pidx={pidx}&return={body['return_url']}",
                                         "expires_at": "x", "expires_in": 1800})
    if path == "/api/v2/epayment/lookup/":
        pidx = json.loads(request.content)["pidx"]
        return httpx.Response(200, json={"pidx": pidx, "status": "Completed", "total_amount": _khalti[pidx][0],
                                         "transaction_id": "FAKETX", "fee": 0, "refunded": False})
    return httpx.Response(404)

payments._transport = httpx.MockTransport(handler)
