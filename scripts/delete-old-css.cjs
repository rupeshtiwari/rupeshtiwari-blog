const http = require('http');

const data = JSON.stringify({
  owner: 'rupeshtiwari',
  repo: 'blogs',
  path: 'assets/css/style.css',
  message: 'Remove old style.css to allow Chirpy theme SCSS to compile'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/delete-file',
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(body));
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
