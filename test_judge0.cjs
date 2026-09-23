const http = require('http');

const body = JSON.stringify({
  source_code: Buffer.from('#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello from ARO";\n    return 0;\n}'.replace(/"/g, '\\"')).toString('base64'),
  language_id: 54,  // C++ language ID for Judge0
  stdin: ''
});

const options = {
  hostname: 'judge0.com',
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
  console.log('Status Code:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => {
    console.log('Response Body (first 500 chars):', data.substring(0, 500));
    try {
      const json = JSON.parse(data);
      console.log('JSON parsed successfully');
      console.log('status:', json.status);
      console.log('status_description:', json.status_description);
      console.log('stdout:', json.stdout);
      console.log('stderr:', json.stderr);
    } catch (e) {
      console.log('Not JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e.message);
});

req.write(body);
req.end();