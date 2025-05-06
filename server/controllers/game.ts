import { Request, Response } from 'express';
import { storage } from '../storage';
import { 
  User, 
  TaskCompletionData,
  Quest,
  Streak,
  DungeonRun
} from '@shared/game';

// Add Express session type declaration to include userId
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};

// Get user's game data
export const getUserGameData = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    const gameData = await storage.getUserGameState(userId);
    
    if (!gameData) {
      return res.status(404).json({ message: 'Game data not found' });
    }
    
    res.status(200).json(gameData);
  } catch (error) {
    console.error('Error getting game data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user's game data
export const updateUserGameData = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    const gameData: User = req.body;
    
    // Validate that the game data belongs to the user
    if (gameData.id !== userId) {
      return res.status(403).json({ message: 'Cannot update game data for another user' });
    }
    
    await storage.updateUserGameState(userId, gameData);
    
    res.status(200).json({ message: 'Game data updated successfully' });
  } catch (error) {
    console.error('Error updating game data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Complete a task (quest task, streak, or dungeon)
export const completeTask = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    const taskData: TaskCompletionData = req.body;
    
    // Get user's game state
    const gameState = await storage.getUserGameState(userId);
    if (!gameState) {
      return res.status(404).json({ message: 'Game data not found' });
    }
    
    // Process task completion based on task type
    let updatedGameState: User;
    let xpGained = 0;
    
    switch (taskData.taskType) {
      case 'quest':
        const questResult = await storage.completeQuestTask(userId, taskData.id, taskData.taskId!);
        updatedGameState = questResult.gameState;
        xpGained = questResult.xpGained;
        break;
      case 'streak':
        const streakResult = await storage.completeStreak(userId, taskData.id);
        updatedGameState = streakResult.gameState;
        xpGained = streakResult.xpGained;
        break;
      case 'dungeon':
        const dungeonResult = await storage.completeDungeon(userId, taskData.id);
        updatedGameState = dungeonResult.gameState;
        xpGained = dungeonResult.xpGained;
        break;
      default:
        return res.status(400).json({ message: 'Invalid task type' });
    }
    
    res.status(200).json({
      message: 'Task completed successfully',
      xpGained,
      gameState: updatedGameState
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a custom quest
export const createQuest = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    const questData: Omit<Quest, 'id'> = req.body;
    
    const updatedGameState = await storage.createQuest(userId, questData);
    
    res.status(201).json({
      message: 'Quest created successfully',
      gameState: updatedGameState
    });
  } catch (error) {
    console.error('Error creating quest:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a dungeon challenge
export const createDungeon = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    const dungeonData: Omit<DungeonRun, 'id' | 'completed' | 'createdAt' | 'completedAt'> = req.body;
    
    const updatedGameState = await storage.createDungeon(userId, dungeonData);
    
    res.status(201).json({
      message: 'Dungeon created successfully',
      gameState: updatedGameState
    });
  } catch (error) {
    console.error('Error creating dungeon:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a streak habit
export const createStreak = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    const streakData: Omit<Streak, 'id' | 'days' | 'lastCompleted' | 'isActive'> = req.body;
    
    const updatedGameState = await storage.createStreak(userId, streakData);
    
    res.status(201).json({
      message: 'Streak created successfully',
      gameState: updatedGameState
    });
  } catch (error) {
    console.error('Error creating streak:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset game data
export const resetGameData = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = req.session.userId;
    
    // Get user info to create new initial state
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create fresh game state
    const newGameState = await storage.resetUserGameState(userId, user.username);
    
    res.status(200).json({
      message: 'Game data reset successfully',
      gameState: newGameState
    });
  } catch (error) {
    console.error('Error resetting game data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
