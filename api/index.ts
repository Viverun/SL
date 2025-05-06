// Vercel serverless function entry point that forwards requests to our Express app
import express from 'express';
import session from 'express-session';
import { registerRoutes } from '../server/routes';
import path from 'path';
import fs from 'fs';

// Create custom error handler to capture and log errors
const logServerError = (err) => {
  console.error('Server error:', err);
  return {
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  };
};

// Initialize Express app with error handling
const createApp = () => {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Session configuration for authentication - compatible with serverless environment
  app.use(session({
    secret: process.env.SESSION_SECRET || 'solo-leveling-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax'
    }
  }));

  return app;
};

// Function to serve static files in the Vercel environment
function serveStaticForVercel(app) {
  try {
    const distPath = path.join(process.cwd(), 'dist/public');
    
    // Check if the directory exists
    if (!fs.existsSync(distPath)) {
      console.warn(`Static directory not found: ${distPath}`);
      return;
    }
    
    // Handle specific asset types first
    app.use('/assets', express.static(path.join(distPath, 'assets')));
    
    // Handle service worker and manifest specifically
    app.get('/sw.js', (req, res) => {
      const filePath = path.join(distPath, 'sw.js');
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(filePath);
      } else {
        res.status(404).send('Service worker not found');
      }
    });
    
    app.get('/manifest.json', (req, res) => {
      const filePath = path.join(distPath, 'manifest.json');
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(filePath);
      } else {
        res.status(404).send('Manifest not found');
      }
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
    app.use('*', (req, res, next) => {
      // Skip API routes
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.setHeader('Content-Type', 'text/html');
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not found: ' + indexPath);
      }
    });
  } catch (error) {
    console.error('Error setting up static file serving:', error);
  }
}

// Create a handler for Vercel serverless deployment
export default async function handler(req, res) {
  try {
    // Initialize Express app
    const app = createApp();
    
    // Create Express server and register API routes
    await registerRoutes(app);
    
    // Add global error handler
    app.use((err, req, res, next) => {
      console.error('Express error:', err);
      res.status(500).json(logServerError(err));
    });
    
    // In production, serve static files
    serveStaticForVercel(app);
    
    // Process the request through Express
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'production' ? {} : error
    });
  }
}