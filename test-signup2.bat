@echo off
curl -s -X POST "http://localhost:4000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"customer_test2@example.com\",\"password\":\"StrongPass123!\",\"name\":\"Test Customer\",\"role\":\"customer\"}"
echo.
