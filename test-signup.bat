@echo off
curl -s -X POST "http://localhost:4000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"merchant_test2@example.com\",\"password\":\"StrongPass123!\",\"name\":\"Test Merchant\",\"role\":\"merchant\"}"
echo.
