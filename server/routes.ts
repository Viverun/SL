import type { Express } from "express";
import { storage } from "./storage";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from './controllers/users';
import {
  requireAuth,
  getUserGameData,
  updateUserGameData,
  completeTask,
  createQuest,
  createDungeon,
  createStreak,
  resetGameData
} from './controllers/game';

export function registerRoutes(app: Express) {
  // Authentication routes
  app.post('/api/auth/register', registerUser);
  app.post('/api/auth/login', loginUser);
  app.post('/api/auth/logout', logoutUser);
  app.get('/api/auth/me', getCurrentUser);
  
  // Game routes (all require authentication)
  app.get('/api/game/data', requireAuth, getUserGameData);
  app.put('/api/game/data', requireAuth, updateUserGameData);
  app.post('/api/game/completeTask', requireAuth, completeTask);
  app.post('/api/game/createQuest', requireAuth, createQuest);
  app.post('/api/game/createDungeon', requireAuth, createDungeon);
  app.post('/api/game/createStreak', requireAuth, createStreak);
  app.post('/api/game/reset', requireAuth, resetGameData);

  // For serverless environments, we don't need to return a server
  // In non-serverless environments, we could create and return a server
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = require('http');
    return createServer(app);
  }

  // Just return the app for serverless environments
  return app;
}
