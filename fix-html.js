const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  
  const metaTags = `
    <meta name="theme-color" content="#10B981" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Vixo" />
    <meta name="mobile-web-app-capable" content="yes" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/assets/icon.png" />`;
  
  html = html.replace('</head>', metaTags + '</head>');
  html = html.replace('<script src="', '<script type="module" src="');
  
  fs.writeFileSync(indexHtmlPath, html);
  console.log('Updated index.html with PWA meta tags');
}

const manifestSrc = path.join(__dirname, 'public', 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('Copied manifest.json to dist');
}
