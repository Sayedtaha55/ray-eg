import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

# Dev-only quick merchant login endpoint and payload is not specified in PRD,
# but exists as POST /api/v1/auth/dev-merchant-login without auth_required.
# So use it to get a merchant auth token for testing.

def test_get_merchant_shop_orders():
    login_url = f"{BASE_URL}/api/v1/auth/dev-merchant-login"
    orders_url = f"{BASE_URL}/api/v1/orders/me"

    session = requests.Session()
    try:
        # Step 1: Obtain auth token via dev merchant login
        login_resp = session.post(login_url, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Merchant login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("accessToken") or login_data.get("token") or login_data.get("jwt")
        assert token, "No auth token received on merchant login"

        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        }

        # Step 2: GET /api/v1/orders/me with auth header
        resp = session.get(orders_url, headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Failed to get merchant shop orders: {resp.text}"
        orders = resp.json()
        assert isinstance(orders, list), "Response is not a list of orders"

    finally:
        session.close()


test_get_merchant_shop_orders()