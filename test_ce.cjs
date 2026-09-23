const http = require('http');

const body = JSON.stringify({
  source_code: Buffer.from('#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from ARO";\n    return 0;\n}'.replace(/"/g, '\\"')).toString('base64'),
  language_id: 54,
  stdin: ''
});

const options = {
  hostname: 'ce.judge0.com',
  port: 443,
  path: '/submissions?base64_encoded=true&wait=false',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': body.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => {
    console.log('=== JUDGE0 CE RESPONSE ===');
    console.log('Status Code:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Response:', data.substring(0, 500));
    try {
      const json = JSON.parse(data);
      console.log('JSON status:', json.status);
      console.log('JSON description:', json.status_description);
      if (json.stdout) {
        console.log('JSON stdout:', fromBase64(json.stdout));
      }
    } catch (e) {
      console.log('Not JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

function fromBase64(value) {
  if (value == null || value === "") {
    return "";
  }
  return Buffer.from(String(value), 'base64').toString('utf8');
}

req.write(body);
req.end();