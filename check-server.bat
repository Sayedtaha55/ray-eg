@echo off
curl -s -w "\nHTTP_CODE:%%{http_code}" -X POST "http://localhost:4000/api/v1/auth/dev-merchant-login"
echo.
curl -s -w "\nHTTP_CODE:%%{http_code}" "http://localhost:4000/api/v1/health"
echo.
