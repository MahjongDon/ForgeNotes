# ForgeNotes Static Deployment Guide

ForgeNotes is designed to work as a static web application that can be hosted anywhere without requiring a server. All data is stored in your browser's localStorage, making it perfect for personal note-taking without any backend requirements.

## Building for Static Deployment

1. First, make sure all dependencies are installed:
   ```bash
   npm install
   ```

2. Build the static version of ForgeNotes:
   ```bash
   npm run build:static
   ```

3. The static build will be created in the `static-dist` folder. This folder contains everything needed to deploy the application.

## Deployment Options

### GitHub Pages (Recommended)

ForgeNotes includes a GitHub Actions workflow file that automates deployment to GitHub Pages:

1. Create a GitHub repository and push your code to it
2. Go to your repository's Settings > Pages
3. Set Source to "GitHub Actions"
4. The workflow will automatically build and deploy your site
5. Your site will be available at `https://username.github.io/repo-name/`

### Netlify

1. Create a Netlify account at [netlify.com](https://www.netlify.com/)
2. Drag and drop the `static-dist` folder to Netlify's dashboard
3. Alternatively, connect your GitHub repository and use the build command `npm run build:static` with publish directory `static-dist`

### Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com/)
2. Import your GitHub repository
3. Set the build command to `npm run build:static`
4. Set the output directory to `static-dist`

### Amazon S3 / CloudFront

1. Create an S3 bucket and enable static website hosting
2. Upload the contents of the `static-dist` folder to your bucket
3. Optionally, set up CloudFront for better performance and HTTPS

### Other Static Hosting

Any platform that can host static HTML, CSS, and JavaScript files will work:
- Firebase Hosting
- Cloudflare Pages
- Azure Static Web Apps
- DigitalOcean App Platform

## Testing Locally

To test your static build locally before deploying:

1. Navigate to the `static-dist` folder
2. Run `npm install` to install the local testing server
3. Run `npm start` to start the local server
4. Open `http://localhost:5000` in your browser

## Important Notes

- All your data is stored in the browser's localStorage and will be specific to each device and browser
- To back up your notes, use the export functionality in the app
- The application will work offline once loaded in the browser
- ForgeNotes works best in modern browsers (Chrome, Firefox, Safari, Edge)