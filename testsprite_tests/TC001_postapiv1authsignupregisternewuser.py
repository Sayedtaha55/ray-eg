import requests
import uuid

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_post_api_v1_auth_signup_register_new_user():
    url = f"{BASE_URL}/api/v1/auth/signup"
    # Use unique email to avoid conflicts
    unique_email = f"testuser_{uuid.uuid4().hex}@example.com"
    payload = {
        "email": unique_email,
        "password": "StrongPass123!",
        "name": "Test User",
        "role": "customer"  # valid roles could be 'customer' or 'merchant'
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        # Check response status code
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        # Response should be a JSON object
        resp_json = response.json()
        # Validate returned object contains at least email, name, role and id
        assert "email" in resp_json, "Response JSON missing 'email'"
        assert resp_json["email"] == unique_email, "Email in response differs from request"
        assert "name" in resp_json, "Response JSON missing 'name'"
        assert resp_json["name"] == "Test User", "Name in response differs from request"
        assert "role" in resp_json, "Response JSON missing 'role'"
        assert resp_json["role"] == "customer", "Role in response differs from request"
        assert "id" in resp_json, "Response JSON missing 'id'"
        # Additional checks can be done if schema is defined
    except requests.RequestException as e:
        assert False, f"HTTP request failed: {e}"
    except ValueError:
        assert False, "Response is not valid JSON"

test_post_api_v1_auth_signup_register_new_user()