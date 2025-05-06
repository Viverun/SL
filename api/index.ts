// Vercel serverless function entry point that forwards requests to our Express app
import express from 'express';
import { registerRoutes } from '../server/routes';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Function to serve static files in the Vercel environment
function serveStaticForVercel(app) {
  const distPath = path.join(process.cwd(), 'dist/public');
  
  // Serve static files
  app.use(express.static(distPath));
  
  // Fallback to index.html
  app.use('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not found: ' + indexPath);
    }
  });
}

// Create a handler for Vercel serverless deployment
export default async function handler(req, res) {
  // Initialize Express server
  const server = await registerRoutes(app);

  // In production, serve static files
  serveStaticForVercel(app);
  
  // Process the request through Express
  return app(req, res);
}