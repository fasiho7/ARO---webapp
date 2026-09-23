cd C:\Users\STUDENT\Desktop\ARO\backend
$env:CLIENT_URL = 'http://localhost:3000'
$env:SUPABASE_URL = 'https://yvtdqwewgfzwwnticzhu.supabase.co'
$env:SUPABASE_ANON_KEY = 'sb_publishable_7nlU1ogEmyvMWbbTSSN-HA_5ZOPFgVv'
$env:BILLING_ADMIN_SECRET = '1f7d93c4a8e24b6f9d2e71c35b4a8fd0c2e9b17a4d5f63c8e1a7b29d4c6f8e10'
& node .\src\server.js