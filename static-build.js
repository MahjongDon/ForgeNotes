// static-build.js
// A helper script to build and prepare the app for static hosting

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building ForgeNotes for static deployment...');

// Step 1: Temporarily copy static.html to the Vite entry point
console.log('Setting up static HTML template...');
const originalIndexHtml = fs.readFileSync(path.join(__dirname, 'client', 'index.html'), 'utf-8');
// No need to copy static.html - we'll use the current index.html which has been updated

// Step 2: Run the Vite build
console.log('Building frontend assets...');
execSync('npx vite build', { stdio: 'inherit' });

// Step 3: Create a static folder
const staticDistDir = path.join(__dirname, 'static-dist');
if (!fs.existsSync(staticDistDir)) {
  fs.mkdirSync(staticDistDir, { recursive: true });
}

// Step 4: Copy public files to static folder
console.log('Copying assets to static folder...');
const publicDir = path.join(__dirname, 'dist', 'public');
const copyDir = (src, dest) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

copyDir(publicDir, staticDistDir);

// Step 5: Add .nojekyll file for GitHub Pages to prevent Jekyll processing
fs.writeFileSync(path.join(staticDistDir, '.nojekyll'), '');

// Step 5b: Update index.html to handle subdomain deployments
const indexHtmlPath = path.join(staticDistDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Add base path configurator script
indexHtml = indexHtml.replace(
  '<head>',
  `<head>
  <base href="./">
  <script>
    // Configure the app for GitHub Pages/subdomain deployment
    window.staticDeployment = true;
    
    // Handle subdomain base path detection for GitHub Pages
    (function() {
      // Get the path segments to determine if we're on a subdomain
      const pathSegments = window.location.pathname.split('/');
      
      // If we're on a subdomain with a repo name (GitHub Pages)
      if (pathSegments.length > 1 && pathSegments[1] !== '') {
        // Tell the app we're on a subdomain
        window.onSubdomain = true;
        window.subdomainPath = '/' + pathSegments[1] + '/';
        
        // If this isn't a redirect from 404.html, we need to set up hash routing
        if (!sessionStorage.getItem('redirectPath') && window.location.hash === '') {
          // Convert path to hash route for proper navigation
          const path = window.location.pathname.replace(window.subdomainPath, '');
          if (path && path !== '/') {
            window.location.replace(window.location.origin + window.subdomainPath + '#' + path);
          }
        }
      }
    })();
  </script>`
);

// Save the updated index.html
fs.writeFileSync(indexHtmlPath, indexHtml);

// Step 6: Create a 404.html that redirects to index.html for GitHub Pages
const notFoundHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>ForgeNotes</title>
    <script>
      // Get the repository name from the URL to handle subdomain deployments
      const pathSegments = window.location.pathname.split('/');
      let basePath = '/';
      
      // If we're on GitHub Pages with a repo name path or on another subdomain
      if (pathSegments.length > 1 && pathSegments[1] !== '') {
        // For GitHub Pages format: /repo-name/...
        basePath = '/' + pathSegments[1] + '/';
      }
      
      // Store the attempted path in session storage
      sessionStorage.setItem('redirectPath', window.location.pathname);
      
      // Redirect to the main page with correct base path
      window.location.href = basePath;
    </script>
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>`;

fs.writeFileSync(path.join(staticDistDir, '404.html'), notFoundHtml);

// Step 6b: Create Netlify configuration files
console.log('Creating Netlify configuration files...');

// Create _redirects file for Netlify
fs.writeFileSync(
  path.join(staticDistDir, '_redirects'),
  '/* /index.html 200'
);

// Step 7: Create a simple static server file (optional for local testing)
console.log('Creating static server file...');
const serverContent = `
// This is a simple static file server for testing purposes only.
// For production, use your preferred static hosting solution.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// For any other routes, serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(\`Static ForgeNotes server running at http://localhost:\${port}\`);
});
`;

fs.writeFileSync(path.join(staticDistDir, 'server.js'), serverContent);

// Step 8: Create a package.json for static deployment
const staticPackageJson = {
  name: 'forge-notes-static',
  version: '1.0.0',
  type: 'module',
  scripts: {
    start: 'node server.js'
  },
  dependencies: {
    express: '^4.18.2'
  }
};

fs.writeFileSync(
  path.join(staticDistDir, 'package.json'),
  JSON.stringify(staticPackageJson, null, 2)
);

// Step 9: Create a README with deployment instructions
const readmeContent = `# ForgeNotes Static Build

This is a static build of ForgeNotes, optimized for deployment to static hosting providers.

## Deployment Options

### Option 1: GitHub Pages (Recommended)
1. Create a GitHub repository
2. Push these files to the repository
3. Go to repository Settings > Pages
4. Set Source to "GitHub Actions"
5. Choose "Static HTML" workflow
6. Visit your site at https://username.github.io/repo-name/

### Option 2: Other Static Hosting
Upload all files in this directory (except server.js and package.json) to:
- Netlify
- Vercel
- Amazon S3
- Any other static hosting provider

### Option 3: Local Testing
1. \`npm install\`
2. \`npm start\`
3. Open http://localhost:5000

## Notes
- All data is stored in the browser's localStorage
- No server or database is required
- The application works offline once loaded
`;

fs.writeFileSync(path.join(staticDistDir, 'README.md'), readmeContent);

console.log('\nStatic build completed! Your files are ready in the static-dist folder.');
console.log('For deployment instructions, see the README.md in that folder.');