@echo off
echo === Dev Merchant Login ===
curl -s -X POST "http://localhost:4000/api/v1/auth/dev-merchant-login" -H "Content-Type: application/json" -d "{}" > temp_login.json
type temp_login.json
echo.
for /f "tokens=2 delims=:," %%a in ('type temp_login.json ^| findstr "accessToken"') do set token=%%a
set token=%token:"=%
set token=%token: =%
echo Token: %token%
echo.
echo === Create Shop ===
curl -s -X POST "http://localhost:4000/api/v1/shops" -H "Content-Type: application/json" -H "Authorization: Bearer %token%" -d "{\"name\":\"Test Reservation Shop\",\"description\":\"Test\"}" > temp_shop.json
type temp_shop.json
echo.
echo.
echo === Create Reservation ===
curl -s -X POST "http://localhost:4000/api/v1/reservations" -H "Content-Type: application/json" -H "Authorization: Bearer %token%" -d "{\"shopId\":\"dummy-shop-id\",\"startTime\":\"2026-07-27T12:00:00Z\",\"endTime\":\"2026-07-27T13:00:00Z\",\"guests\":2,\"notes\":\"Test reservation\"}"
echo.
