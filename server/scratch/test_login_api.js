const http = require('http');

const data = JSON.stringify({
  email: 'business@test.com',
  password: 'password123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('Sending login request...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('Response Body:', body); });
});

req.on('error', (e) => {
  console.error('Error occurred:', e);
});

req.write(data);
req.end();
