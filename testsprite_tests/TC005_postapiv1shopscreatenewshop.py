import requests
import uuid

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_postapiv1shopscreatenewshop():
    session = requests.Session()
    headers = {
        "Content-Type": "application/json"
    }

    # Dev login merchant to get authentication token (per PRD dev-login available)
    login_url = f"{BASE_URL}/api/v1/auth/dev-merchant-login"
    login_resp = session.post(login_url, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Dev merchant login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert 'accessToken' in login_data or 'token' in login_data or 'jwt' in login_data or 'access_token' in login_data or 'token' in login_data, \
        "No token found in login response"
    # Support multiple possible token keys depending on implementation
    token = login_data.get('accessToken') or login_data.get('token') or login_data.get('jwt') or login_data.get('access_token')
    auth_headers = headers.copy()
    auth_headers["Authorization"] = f"Bearer {token}"

    # Prepare new shop data (sample valid minimal data)
    # Since no detailed request schema for shop creation body provided, create dummy plausible fields
    # We'll generate unique name using uuid to avoid conflicts
    unique_suffix = str(uuid.uuid4())[:8]
    shop_data = {
        "name": f"Test Shop {unique_suffix}",
        "description": "Test shop created by automated test.",
        "address": "123 Test Street, Cairo",
        "email": f"testshop{unique_suffix}@example.com",
        "phone": "+201234567890",
        "category": "general",
        "website": "https://example.com",
        "location": {
            "latitude": 30.0444,
            "longitude": 31.2357
        }
    }

    # POST /api/v1/shops (Create shop)
    create_url = f"{BASE_URL}/api/v1/shops"
    create_resp = session.post(create_url, json=shop_data, headers=auth_headers, timeout=TIMEOUT)
    try:
        assert create_resp.status_code == 201, f"Create shop failed: {create_resp.status_code} {create_resp.text}"
        created_shop = create_resp.json()
        # Basic validations on response fields typical for shop resource
        assert isinstance(created_shop, dict), "Response is not a JSON object"
        assert "id" in created_shop or "_id" in created_shop, "Created shop has no 'id'"
        assert created_shop.get("name") == shop_data["name"], "Created shop name mismatch"
    finally:
        # Cleanup - delete created shop
        # Need to delete the shop - but no DELETE endpoint is listed for shops explicitly.
        # DELETE not documented for shop resource; assuming no delete endpoint exists.
        # So best effort: attempt to PATCH with status "deleted" or suspend? Not specified.
        # We can't delete the shop via API. So no cleanup possible.
        # If deletion is supported, would do it here.

        # If wanted, could try a PATCH to admin status to suspended if admin auth available, but no admin auth here.
        pass

test_postapiv1shopscreatenewshop()