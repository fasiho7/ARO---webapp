const http = require('http');

const body = JSON.stringify({
  source_code: 'dGVubmluZyBpbiBhIHJlc2l6ZQ=='.toString(),  // "Hello" base64
  language_id: 54,
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
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log('=== JUDGE0 RESPONSE ===');
    console.log('Status Code:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('Response length:', body.length);
    console.log('Response preview:', body.substring(0, 200));
    
    // Check if it's JSON
    if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
      try {
        const json = JSON.parse(body);
        console.log('JSON status:', json.status);
        console.log('JSON description:', json.status_description);
      } catch (e) {
        console.log('JSON parse error:', e.message);
      }
    } else {
      console.log('NOT a JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('=== REQUEST ERROR ===');
  console.error('Error:', e.message);
});

req.write(body);
req.end();