// Standalone API handler for Vercel serverless functions
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { drizzle, type DrizzleClient } from "drizzle-orm/neon-serverless";
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { eq } from "drizzle-orm";
import * as argon2 from 'argon2';
import path from 'path';
import fs from 'fs';

// Import local copies of schema and game logic
import { users, gameStates } from "./lib/schema";
import { createInitialUserState } from "./lib/game";

// Add session type declaration
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Create Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
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

// Database connection
let db: DrizzleClient | undefined;
try {
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    // Fix the drizzle initialization with proper typing
    db = drizzle(sql as any);
    console.log('Database connection established');
  } else {
    console.warn('DATABASE_URL not found, database operations will fail');
  }
} catch (error: unknown) {
  console.error('Failed to connect to database:', error);
}

// Authentication routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Validate database connection
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await argon2.hash(password);
    
    // Create user
    const newUser = await db.insert(users).values({
      username,
      password: hashedPassword
    }).returning();
    
    const user = newUser[0];
    
    // Create initial game state for the user
    const gameState = createInitialUserState(user.id, user.username);
    await db.insert(gameStates).values({
      userId: user.id,
      data: gameState
    });
    
    // Set user in session
    req.session.userId = user.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error: unknown) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Validate database connection
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Check if username exists
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = result[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Set user in session
    req.session.userId = user.id;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error: unknown) {
    console.error('Error logging in user:', error);
    res.status(500).json({ 
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    res.status(200).json({ message: 'Already logged out' });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate database connection
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Get user
    const result = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    const user = result[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error: unknown) {
    console.error('Error getting current user:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
    });
  }
});

// Game routes
app.get('/api/game/data', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Validate database connection
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Get game data
    const result = await db.select().from(gameStates).where(eq(gameStates.userId, req.session.userId)).limit(1);
    
    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'Game data not found' });
    }
    
    res.status(200).json(result[0].data);
  } catch (error: unknown) {
    console.error('Error getting game data:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
    });
  }
});

// Static file serving
app.use(express.static(path.join(process.cwd(), 'dist/public')));

// Client-side routing fallback
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  const indexPath = path.join(process.cwd(), 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Global error handler
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error('API error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err instanceof Error ? err.message : String(err)
  });
});

// Export the Express app as the serverless function handler
export default app;
