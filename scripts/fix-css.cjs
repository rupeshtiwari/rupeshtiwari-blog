const http = require('http');

const styleScssContent = `---
---

@import "jekyll-theme-chirpy";
`;

const data = JSON.stringify({
  owner: 'rupeshtiwari',
  repo: 'blogs',
  path: 'assets/css/style.scss',
  content: styleScssContent,
  message: 'Fix CSS: Add style.scss to import Chirpy theme styles'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/update-file',
  method: 'POST',
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
