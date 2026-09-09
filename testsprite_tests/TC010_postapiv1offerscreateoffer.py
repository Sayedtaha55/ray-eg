import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_post_api_v1_offers_create_offer():
    # Step 1: Login as dev merchant to get authenticated token
    login_url = f"{BASE_URL}/api/v1/auth/dev-merchant-login"
    try:
        login_resp = requests.post(login_url, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Dev merchant login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "token" in login_data or "accessToken" in login_data or "jwt" in login_data, "No token found in login response"
        # Attempt to extract token from common keys
        token = login_data.get("token") or login_data.get("accessToken") or login_data.get("jwt")
        assert token, "Extracted token is empty"
    except Exception as e:
        raise AssertionError(f"Login request failed or invalid response: {e}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Prepare sample offer data for creation (assuming typical offer fields)
    # As no detailed schema is provided, using a minimal plausible offer payload
    offer_payload = {
        "title": "Summer Sale 2026",
        "description": "20% off on all items for summer collection",
        "discountPercentage": 20,
        "validFrom": "2026-07-30T00:00:00Z",
        "validTo": "2026-08-31T23:59:59Z",
        "active": True
    }

    url = f"{BASE_URL}/api/v1/offers"

    try:
        response = requests.post(url, json=offer_payload, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 201, f"Expected status 201, got {response.status_code}"
        offer_data = response.json()
        # Minimal validation: check returned data contains id and title matching input
        assert "id" in offer_data, "Created offer response missing 'id'"
        assert offer_data.get("title") == offer_payload["title"], "Offer title in response does not match payload"
        # Optionally check other fields if present
        # For example, discountPercentage, active status etc.
    except Exception as e:
        raise AssertionError(f"Offer creation request failed or validation error: {e}")

test_post_api_v1_offers_create_offer()