const http = require('http');

const workflowContent = `name: "Build and Deploy"
on:
  push:
    branches:
      - main
      - master
    paths-ignore:
      - .gitignore
      - README.md
      - LICENSE

  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 3.3
          bundler-cache: true

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Build CSS and JS assets
        run: npm ci && npm run build

      - name: Build site
        run: bundle exec jekyll b -d "_site\${{ steps.pages.outputs.base_path }}"
        env:
          JEKYLL_ENV: "production"

      - name: Test site
        continue-on-error: true
        run: |
          bundle exec htmlproofer _site \\
            --disable-external \\
            --ignore-urls "/^http:\\/\\/127.0.0.1/,/^http:\\/\\/0.0.0.0/,/^http:\\/\\/localhost/"

      - name: Upload site artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "_site\${{ steps.pages.outputs.base_path }}"

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

const data = JSON.stringify({
  owner: 'rupeshtiwari',
  repo: 'blogs',
  path: '.github/workflows/pages-deploy.yml',
  content: workflowContent,
  message: 'Fix CSS: Add npm build step for Chirpy theme assets'
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
