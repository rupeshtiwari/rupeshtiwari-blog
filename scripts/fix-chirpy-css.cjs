const http = require('http');

// First delete the wrong style.scss
const deleteData = JSON.stringify({
  owner: 'rupeshtiwari',
  repo: 'blogs',
  path: 'assets/css/style.scss',
  message: 'Remove incorrect style.scss'
});

const deleteOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/delete-file',
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(deleteData)
  }
};

const deleteReq = http.request(deleteOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Delete result:', body);
    
    // Now create the correct file
    const correctContent = `---
---

@use 'main{%- if jekyll.environment == 'production' -%}.bundle{%- endif -%}';
`;

    const createData = JSON.stringify({
      owner: 'rupeshtiwari',
      repo: 'blogs',
      path: 'assets/css/jekyll-theme-chirpy.scss',
      content: correctContent,
      message: 'Fix CSS: Add correct jekyll-theme-chirpy.scss for Chirpy starter'
    });

    const createOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/update-file',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(createData)
      }
    };

    const createReq = http.request(createOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => console.log('Create result:', body));
    });

    createReq.on('error', (e) => console.error('Create error:', e.message));
    createReq.write(createData);
    createReq.end();
  });
});

deleteReq.on('error', (e) => console.error('Delete error:', e.message));
deleteReq.write(deleteData);
deleteReq.end();
