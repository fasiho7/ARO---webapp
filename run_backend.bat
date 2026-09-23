@echo off
cd C:\Users\STUDENT\Desktop\ARO\backend
set CLIENT_URL=http://localhost:3000
set SUPABASE_URL=https://yvtdqwewgfzwwnticzhu.supabase.co
set SUPABASE_ANON_KEY=sb_publishable_7nlU1ogEmyvMWbbTSSN-HA_5ZOPFgVv
set JUDGE0_API_URL=https://judge0.com
set BILLING_ADMIN_SECRET=1f7d93c4a8e24b6f9d2e71c35b4a8fd0c2e9b17a4d5f63c8e1a7b29d4c6f8e10
echo Starting backend with all required env vars...
node src/server.js