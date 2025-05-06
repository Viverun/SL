// Vercel serverless function entry point that forwards requests to our Express app
import express from 'express';
import session from 'express-session';
import { registerRoutes } from '../server/routes';
import path from 'path';
import fs from 'fs';

// Create Express app for serverless environment
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration for serverless environment
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

// Register API routes
registerRoutes(app);

// Function to serve static files in the Vercel environment
function serveStaticForVercel(app) {
  try {
    const distPath = path.join(process.cwd(), 'dist/public');
    
    // Check if the directory exists
    if (!fs.existsSync(distPath)) {
      console.warn(`Static directory not found: ${distPath}`);
      return;
    }
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback for client-side routing (important for SPA)
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return;
      }
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('index.html not found');
      }
    });
  } catch (error) {
    console.error('Error setting up static file serving:', error);
  }
}

// Serve static files
serveStaticForVercel(app);

// Set up error handling
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Export the Express app as the serverless function handler
export default app;