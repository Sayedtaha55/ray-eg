import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_get_current_user_shop():
    session = requests.Session()
    try:
        # Step 1: Perform a dev-only quick merchant login to get authentication token
        login_resp = session.post(f"{BASE_URL}/api/v1/auth/dev-merchant-login", timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "accessToken" in login_data or "token" in login_data or login_resp.cookies, "No auth token/cookie received"

        # If JWT token returned, set Authorization header; fallback to cookies if session manages it automatically
        token = login_data.get("accessToken") or login_data.get("token")
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        # Step 2: Retrieve current user's shop
        resp = session.get(f"{BASE_URL}/api/v1/shops/me", headers=headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"Expected status 200, got {resp.status_code}"

        shop_data = resp.json()
        # Validate shop_data basic structure - assume at least id and owner info
        assert isinstance(shop_data, dict), "Shop data is not a dictionary"
        assert "id" in shop_data and shop_data["id"], "Shop data missing 'id'"
        assert "ownerId" in shop_data or "merchantId" in shop_data, "Shop data missing owner identifier"
        assert "name" in shop_data and shop_data["name"], "Shop data missing 'name'"

    finally:
        # Logout to clear session
        try:
            session.post(f"{BASE_URL}/api/v1/auth/logout", headers=headers, timeout=TIMEOUT)
        except Exception:
            pass
        session.close()

test_get_current_user_shop()