import requests

def test_post_api_v1_auth_password_forgot_request_reset_email():
    base_url = "http://localhost:4000"
    endpoint = "/api/v1/auth/password/forgot"
    url = base_url + endpoint
    
    # Use a known registered email for the test
    registered_email = "registereduser@example.com"
    payload = {"email": registered_email}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"
    
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    # Optionally, check if response contains confirmation message or object
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    
    # The PRD does not specify exact response body for 200, so just verify response is a JSON object
    assert isinstance(data, dict), "Response JSON is not an object"

test_post_api_v1_auth_password_forgot_request_reset_email()