@echo off
cd C:\Users\STUDENT\Desktop\ARO\backend
set CLIENT_URL=http://localhost:3000
set SUPABASE_URL=https://yvtdqwewgfzwwnticzhu.supabase.co
set SUPABASE_ANON_KEY=sb_publishable_7nlU1ogEmyvMWbbTSSN-HA_5ZOPFgVv
set JUDGE0_API_URL=https://judge0.com
set BILLING_ADMIN_SECRET=1f7d93c4a8e24b6f9d2e71c35b4a8fd0c2e9b17a4d5f63c8e1a7b29d4c6f8e10
echo.
echo Starting backend server...
node src/server.js > NUL 2>&1 &
set BACKEND_PID=%%
timeout /t 3 > nul
echo.
echo Testing /api/access/me...
curl -v http://localhost:5000/api/access/me
echo.
echo.
echo Testing POST /api/coding/run...
curl -v -X POST http://localhost:5000/api/coding/run ^
  -H "Content-Type: application/json" ^
  -d "{\"language\":\"C++\",\"sourceCode\":\"#include <iostream>\\nusing namespace std;\\nint main() { cout << \"ARO TEST\"; return 0; }\",\"stdin\":\"\",\"problemId\":\"test1\"}"