@echo off
curl -s -w "\nHTTP:%%{http_code}" -X POST "http://localhost:4000/api/v1/auth/dev-merchant-login"
echo.
curl -s -w "\nHTTP:%%{http_code}" -X POST "http://localhost:4000/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"user@example.com\",\"password\":\"Password123!\"}"
echo.
curl -s -w "\nHTTP:%%{http_code}" -X POST "http://localhost:4000/api/v1/auth/signup" -H "Content-Type: application/json" -d "{\"email\":\"test_new@example.com\",\"password\":\"StrongPass123!\",\"name\":\"Test\",\"role\":\"customer\"}"
echo.
