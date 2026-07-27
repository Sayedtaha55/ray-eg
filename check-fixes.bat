@echo off
curl -s -X POST "http://localhost:4000/api/v1/auth/dev-customer-login" -H "Content-Type: application/json" -d "{}"
echo.
curl -s -X POST "http://localhost:4000/api/v1/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"testuser@example.com\",\"password\":\"TestPassword123!\"}"
echo.
