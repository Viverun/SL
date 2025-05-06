// Standalone API handler for Vercel serverless functions
import express, { Request, Response, NextFunction } from 'express';
import { drizzle } from "drizzle-orm/neon-http";  // Change to neon-http for compatibility
import { neon } from '@neondatabase/serverless';
import { eq } from "drizzle-orm";
import * as argon2 from 'argon2';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

//-----------------------------------------------------------
// SCHEMA DEFINITIONS - Inlined from ./lib/schema.ts
//-----------------------------------------------------------

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Game state table to store player's game data
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameState = typeof gameStates.$inferSelect;

//-----------------------------------------------------------
// GAME LOGIC - Inlined from ./lib/game.ts
//-----------------------------------------------------------

// Game data interfaces
export interface GameUser {
  id: number;
  username: string;
  level: number;
  currentXP: number;
  requiredXP: number;
  stats: Stats;
  achievements: Achievement[];
  skills: Skill[];
  inventory: Item[];
  quests: Quest[];
  streaks: Streak[];
  dungeonRuns: DungeonRun[];
}

export interface Stats {
  strength: number;
  intelligence: number;
  endurance: number;
  willpower: number;
  charisma: number;
  dexterity: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  type: 'combat' | 'intellect' | 'utility' | 'special';
  effect: string;
  icon: string;
  unlocked: boolean;
  parentSkillId?: string;
  isActive: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effect: string;
  icon: string;
  isEquipped: boolean;
  statBoosts?: Partial<Stats>;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'storyline';
  requirements: QuestTask[];
  xpReward: number;
  itemReward?: Item;
  skillReward?: Skill;
  isComplete: boolean;
  deadline?: Date;
}

export interface QuestTask {
  id: string;
  description: string;
  isComplete: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface Streak {
  id: string;
  name: string;
  description: string;
  days: number;
  lastCompleted: Date;
  isActive: boolean;
}

export interface DungeonRun {
  id: string;
  name: string;
  description: string;
  duration: number;
  completed: boolean;
  rewards: {
    xp: number;
    items?: Item[];
  };
  createdAt: Date;
  completedAt?: Date;
}

// Initial stats for a new user
const initialStats: Stats = {
  strength: 5,
  intelligence: 5,
  endurance: 5,
  willpower: 5,
  charisma: 5,
  dexterity: 5
};

// Starting skills
const initialSkills: Skill[] = [
  {
    id: 'skill-basic-fitness',
    name: 'Basic Fitness',
    description: 'The foundation of physical development',
    level: 1,
    type: 'combat',
    effect: 'Increases strength gains by 5%',
    icon: 'dumbbell',
    unlocked: true,
    isActive: true
  },
  {
    id: 'skill-focused-study',
    name: 'Focused Study',
    description: 'Ability to concentrate on learning tasks',
    level: 1,
    type: 'intellect',
    effect: 'Increases intelligence gains by 5%',
    icon: 'book-open',
    unlocked: true,
    isActive: true
  },
  {
    id: 'skill-basic-meditation',
    name: 'Basic Meditation',
    description: 'Simple meditation techniques for mental clarity',
    level: 1,
    type: 'utility',
    effect: 'Increases willpower gains by 5%',
    icon: 'brain',
    unlocked: true,
    isActive: true
  }
];

// Starting items
const initialItems: Item[] = [
  {
    id: 'item-novice-journal',
    name: 'Novice Journal',
    description: 'A simple journal to track your progress',
    type: 'accessory',
    rarity: 'common',
    effect: 'Increases XP gain by 2%',
    icon: 'book',
    isEquipped: true,
    statBoosts: {
      intelligence: 1
    }
  },
  {
    id: 'item-basic-training-gear',
    name: 'Basic Training Gear',
    description: 'Simple workout clothes for beginners',
    type: 'armor',
    rarity: 'common',
    effect: 'Increases physical activity XP by 3%',
    icon: 'shirt',
    isEquipped: true,
    statBoosts: {
      strength: 1,
      endurance: 1
    }
  }
];

// Starting quests
const initialQuests: Quest[] = [
  {
    id: 'quest-tutorial',
    name: 'Awakening',
    description: 'Complete the tutorial to understand your new powers',
    type: 'storyline',
    requirements: [
      {
        id: uuidv4(),
        description: 'Create your first task',
        isComplete: false
      },
      {
        id: uuidv4(),
        description: 'Complete your first task',
        isComplete: false
      },
      {
        id: uuidv4(),
        description: 'View your skill tree',
        isComplete: false
      }
    ],
    xpReward: 50,
    isComplete: false
  },
  {
    id: 'quest-daily-routine',
    name: 'Daily Routine',
    description: 'Establish a daily habit to increase your power',
    type: 'daily',
    requirements: [
      {
        id: uuidv4(),
        description: 'Complete one physical activity',
        isComplete: false
      },
      {
        id: uuidv4(),
        description: 'Complete one mental activity',
        isComplete: false
      }
    ],
    xpReward: 30,
    isComplete: false,
    deadline: new Date(new Date().setHours(23, 59, 59, 999))
  }
];

// Starting achievements
const initialAchievements: Achievement[] = [
  {
    id: 'achievement-awakened',
    name: 'Awakened',
    description: 'Start your journey as a Hunter',
    icon: 'sunrise',
    isUnlocked: true,
    unlockedAt: new Date()
  },
  {
    id: 'achievement-first-level',
    name: 'The Beginning',
    description: 'Reach level 2',
    icon: 'trending-up',
    isUnlocked: false
  },
  {
    id: 'achievement-streak-3',
    name: 'Consistent',
    description: 'Maintain a streak for 3 days',
    icon: 'calendar',
    isUnlocked: false
  }
];

// Starting streaks
const initialStreaks: Streak[] = [
  {
    id: 'streak-daily-activity',
    name: 'Daily Activity',
    description: 'Complete at least one activity every day',
    days: 0,
    lastCompleted: new Date(new Date().setDate(new Date().getDate() - 1)),
    isActive: true
  }
];

// Initial state for a new user
export const createInitialUserState = (id: number, username: string): GameUser => ({
  id,
  username,
  level: 1,
  currentXP: 0,
  requiredXP: 100,
  stats: initialStats,
  achievements: initialAchievements,
  skills: initialSkills,
  inventory: initialItems,
  quests: initialQuests,
  streaks: initialStreaks,
  dungeonRuns: []
});

//-----------------------------------------------------------
// JWT AUTHENTICATION
//-----------------------------------------------------------

// JWT Secret key
const JWT_SECRET = process.env.JWT_SECRET || 'solo-leveling-jwt-secret';

// JWT Token expiration (7 days)
const JWT_EXPIRES_IN = '7d';

// Generate JWT token for a user
const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Add userId to request object
    (req as any).userId = payload.userId;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

//-----------------------------------------------------------
// EXPRESS API
//-----------------------------------------------------------

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

// Add CORS headers to support cross-origin requests
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Database connection
const connectToDatabase = () => {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not found, database operations will fail');
      return undefined;
    }

    // The proper way to connect to Neon with Drizzle in serverless
    const sql = neon(process.env.DATABASE_URL);
    
    // We need to ensure sql is a function that takes queryString and params
    if (typeof sql !== 'function') {
      console.error('Neon client initialization failed');
      return undefined;
    }
    
    return drizzle(sql);
  } catch (error: unknown) {
    console.error('Failed to connect to database:', error);
    return undefined;
  }
};

// Authentication routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    console.log('Register request received:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Connect to database for this request
    const db = connectToDatabase();
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
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      user: userWithoutPassword,
      token
    });
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
    
    // Connect to database for this request
    const db = connectToDatabase();
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
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      user: userWithoutPassword,
      token
    });
  } catch (error: unknown) {
    console.error('Error logging in user:', error);
    res.status(500).json({ 
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  // With JWT, we don't need server-side logout
  // The client should simply discard the token
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticate, async (req: Request, res: Response) => {
  try {
    // User is authenticated via the middleware
    const userId = (req as any).userId;
    
    // Connect to database for this request
    const db = connectToDatabase();
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Get user
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
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
app.get('/api/game/data', authenticate, async (req: Request, res: Response) => {
  try {
    // User is authenticated via the middleware
    const userId = (req as any).userId;
    
    // Connect to database for this request
    const db = connectToDatabase();
    if (!db) {
      return res.status(500).json({ message: 'Database connection not available' });
    }
    
    // Get game data
    const result = await db.select().from(gameStates).where(eq(gameStates.userId, userId)).limit(1);
    
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
