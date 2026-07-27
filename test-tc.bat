@echo off
echo === TC007: Order Creation ===
curl -s -X POST "http://localhost:4000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"test_order@example.com\",\"password\":\"TestPass123!\",\"name\":\"Test Order Customer\",\"role\":\"customer\"}"
echo.
echo === TC009: Reservation ===
curl -s -X POST "http://localhost:4000/api/v1/auth/dev-merchant-login" -H "Content-Type: application/json" -d "{}"
echo.
