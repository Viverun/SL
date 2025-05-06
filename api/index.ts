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
  
  // Handle specific asset types first
  app.use('/assets', express.static(path.join(distPath, 'assets')));
  
  // Handle service worker and manifest specifically
  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(distPath, 'sw.js'));
  });
  
  app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(distPath, 'manifest.json'));
  });
  
  // Serve other static files
  app.use(express.static(distPath, {
    index: false // Don't automatically serve index.html
  }));
  
  // Special handling for the root path - always serve index.html
  app.get('/', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  });
  
  // Fallback for client-side routing
  app.use('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
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