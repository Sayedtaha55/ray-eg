@echo off
curl -s -X POST "http://localhost:4000/api/v1/shops" -H "Content-Type: application/json" -H "Authorization: Bearer test" -d "{\"name\":\"test\"}"
echo.
