import requests

BASE_URL = "http://localhost:4000"
LOGIN_ENDPOINT = "/api/v1/auth/login"
TIMEOUT = 30

def test_postapiv1authloginuserauthentication():
    # This test case assumes there is a valid user in the system.
    # Use a known valid email and password for testing.
    login_payload = {
        "email": "validuser@example.com",
        "password": "ValidPassword123!"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=login_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    # Assert HTTP 200 OK on success
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"

    # Assert response body contains authenticated session or JWT token (assuming a token field)
    try:
        response_json = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check presence of token or session data indicative keys (commonly 'token' or 'accessToken')
    token_keys = ['token', 'accessToken', 'jwt', 'session']
    assert any(key in response_json for key in token_keys), \
        f"Response JSON missing authentication token/session keys: expected one of {token_keys}, got {list(response_json.keys())}"

test_postapiv1authloginuserauthentication()