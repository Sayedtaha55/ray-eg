import requests
import uuid
import datetime

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_post_api_v1_reservations_create_reservation():
    session = requests.Session()
    try:
        # 1. Authenticate user via dev-merchant-login (assuming this as a quick login for auth)
        login_resp = session.post(
            f"{BASE_URL}/api/v1/auth/dev-merchant-login",
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        auth_data = login_resp.json()
        # Extract token (assumed JWT token in 'accessToken' or similar)
        token = auth_data.get("accessToken") or auth_data.get("token") or auth_data.get("access_token")
        assert token, "No auth token found in login response"
        session.headers.update({"Authorization": f"Bearer {token}"})

        # 2. Get current user's shop (needed because reservation may need shopId or context)
        shop_resp = session.get(f"{BASE_URL}/api/v1/shops/me", timeout=TIMEOUT)
        assert shop_resp.status_code == 200, f"Fetching user shop failed: {shop_resp.text}"
        shop_data = shop_resp.json()
        shop_id = shop_data.get("id")
        assert shop_id, "User's shop id not found"

        # 3. Prepare reservation data - use current datetime for a future reservation time
        now = datetime.datetime.utcnow()
        reservation_start = (now + datetime.timedelta(hours=1)).isoformat() + "Z"  # ISO8601 with Zulu
        reservation_end = (now + datetime.timedelta(hours=2)).isoformat() + "Z"

        # Example reservation payload - assuming structure based on common reservation details
        reservation_payload = {
            # There is no explicit schema for reservation POST body in PRD snippet,
            # so we provide a plausible payload with typical fields.
            "shopId": shop_id,
            "startTime": reservation_start,
            "endTime": reservation_end,
            "guestCount": 2,
            "specialRequest": f"Test reservation {uuid.uuid4()}",
            # Possibly user details could be auto-assigned from auth session on backend
        }

        # 4. Create reservation
        create_resp = session.post(f"{BASE_URL}/api/v1/reservations",
                                   json=reservation_payload,
                                   timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Create reservation failed: {create_resp.text}"
        reservation_data = create_resp.json()
        reservation_id = reservation_data.get("id")
        assert reservation_id, "Reservation ID not found in response"

    finally:
        # 5. Clean up: delete reservation if created - but no delete endpoint info in PRD for reservations.
        # So here we just pass as no explicit delete endpoint available.
        pass

test_post_api_v1_reservations_create_reservation()