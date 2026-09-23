$ErrorActionPreference = "Stop"
cd "C:\Users\STUDENT\Desktop\ARO\backend"
$env:CLIENT_URL = "http://localhost:3000"
$env:SUPABASE_URL = "https://yvtdqwewgfzwwnticzhu.supabase.co"
$env:SUPABASE_ANON_KEY = "sb_publishable_7nlU1ogEmyvMWbbTSSN-HA_5ZOPFgVv"
$env:JUDGE0_API_URL = "https://judge0.com"
$env:BILLING_ADMIN_SECRET = "1f7d93c4a8e24b6f9d2e71c35b4a8fd0c2e9b17a4d5f63c8e1a7b29d4c6f8e10"

Write-Host "Starting backend server..."
$proc = & node .\src\server.js
Start-Sleep -Seconds 3

Write-Host "Testing /api/access/me..."
$result = Invoke-Expression "curl -v http://localhost:5000/api/access/me 2>&1"
Write-Host $result

Write-Host "Testing POST /api/coding/run..."
$payload = @{language="C++"; sourceCode="#include <iostream>using namespace std;int main() { cout << \"ARO TEST\"; return 0; }"; stdin=""; problemId="test1"}
$json = $payload | ConvertTo-Json -Depth 5
$headers = @{"Content-Type"="application/json"}
$curlCmd = "curl -v -X POST http://localhost:5000/api/coding/run -H `"Content-Type: application/json`" -d `"$json`""
$result = Invoke-Expression $curlCmd
Write-Host $result