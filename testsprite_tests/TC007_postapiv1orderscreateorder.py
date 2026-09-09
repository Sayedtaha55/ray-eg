import requests

BASE_URL = "http://localhost:4000"
TIMEOUT = 30

def test_postapiv1orderscreateorder():
    session = requests.Session()
    try:
        # Step 1: Login as existing customer user (dev quick login)
        login_resp = session.post(
            f"{BASE_URL}/api/v1/auth/dev-merchant-login",
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_data = login_resp.json()
        assert "token" in login_data or "accessToken" in login_data or login_resp.cookies, "No token or cookie found in login response"
        # Auth details assumed in session headers or cookies by dev login

        # Step 2: Create a minimal product to be ordered (requires a shop)
        # Get the merchant's shop ID
        shop_resp = session.get(f"{BASE_URL}/api/v1/shops/me", timeout=TIMEOUT)
        assert shop_resp.status_code == 200, f"Failed to get merchant shop, status {shop_resp.status_code}"
        shop_data = shop_resp.json()
        shop_id = shop_data.get("id") or shop_data.get("_id")
        assert shop_id, "Merchant shop ID not found"

        # Create a product for the order
        product_payload = {
            "shopId": shop_id,
            "name": "Test Product for Order",
            "price": 25.50,
            "stock": 10,
            "category": "test-category",
            "imageUrl": "http://example.com/image.png",
            "description": "A test product for order creation."
        }
        product_resp = session.post(f"{BASE_URL}/api/v1/products", json=product_payload, timeout=TIMEOUT)
        assert product_resp.status_code == 201, f"Product creation failed with status {product_resp.status_code}"
        product_data = product_resp.json()
        product_id = product_data.get("id") or product_data.get("_id")
        assert product_id, "Product ID missing from creation response"

        # Step 3: Prepare order creation payload
        # The PRD does not specify detailed order schema, assume minimal order structure with product IDs and quantities
        order_payload = {
            "items": [
                {
                    "productId": product_id,
                    "quantity": 2
                }
            ],
            # optionally additional fields can be added if known such as shipping address, payment, etc.
        }

        # Step 4: Create order
        order_resp = session.post(f"{BASE_URL}/api/v1/orders", json=order_payload, timeout=TIMEOUT)
        assert order_resp.status_code == 201, f"Order creation failed with status {order_resp.status_code}"
        order_data = order_resp.json()
        assert "id" in order_data or "_id" in order_data, "Created order ID missing"
        assert "items" in order_data and len(order_data["items"]) > 0, "Created order items missing or empty"

    finally:
        # Cleanup: Delete the created product and order if API allows (not specified in PRD)
        # Try deleting the created order - no delete endpoint specified for orders in PRD, so skip
        # Delete product to clean up
        try:
            if 'product_id' in locals():
                del_prod_resp = session.delete(f"{BASE_URL}/api/v1/products/{product_id}", timeout=TIMEOUT)
                # Product delete requires auth and returns 200 on success, but if fails ignore
        except Exception:
            pass

test_postapiv1orderscreateorder()