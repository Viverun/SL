import type { Express } from "express";
import { createServer, type Server } from "http";
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

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);

  return httpServer;
}
