import { users, type User, type InsertUser, gameStates } from "@shared/schema";
import { User as GameUser } from "@shared/game";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from '@neondatabase/serverless';
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserGameState(userId: number): Promise<GameUser | undefined>;
  createUserGameState(userId: number, gameState: GameUser): Promise<void>;
  updateUserGameState(userId: number, gameState: GameUser): Promise<void>;
  resetUserGameState(userId: number, username: string): Promise<GameUser>;
  completeQuestTask(userId: number, questId: string, taskId: string): Promise<{gameState: GameUser, xpGained: number}>;
  completeStreak(userId: number, streakId: string): Promise<{gameState: GameUser, xpGained: number}>;
  completeDungeon(userId: number, dungeonId: string): Promise<{gameState: GameUser, xpGained: number}>;
  createQuest(userId: number, questData: any): Promise<GameUser>;
  createDungeon(userId: number, dungeonData: any): Promise<GameUser>;
  createStreak(userId: number, streakData: any): Promise<GameUser>;
}

// In-memory storage implementation - keeping this as a fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameStates: Map<number, GameUser>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.gameStates = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserGameState(userId: number): Promise<GameUser | undefined> {
    return this.gameStates.get(userId);
  }

  async createUserGameState(userId: number, gameState: GameUser): Promise<void> {
    this.gameStates.set(userId, gameState);
  }

  async updateUserGameState(userId: number, gameState: GameUser): Promise<void> {
    this.gameStates.set(userId, gameState);
  }

  async resetUserGameState(userId: number, username: string): Promise<GameUser> {
    const { createInitialUserState } = await import('@shared/game');
    const newState = createInitialUserState(userId, username);
    this.gameStates.set(userId, newState);
    return newState;
  }

  async completeQuestTask(userId: number, questId: string, taskId: string): Promise<{gameState: GameUser, xpGained: number}> {
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const quest = gameState.quests.find(q => q.id === questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    const task = quest.requirements.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Mark task as complete
    task.isComplete = true;

    // Check if all tasks are complete to mark quest as complete
    const allTasksComplete = quest.requirements.every(t => t.isComplete);
    let xpGained = 0;

    if (allTasksComplete && !quest.isComplete) {
      quest.isComplete = true;
      xpGained = quest.xpReward;
      
      // Add XP to user
      const { completeTask: completeTaskHelper } = await import('@shared/game');
      const result = completeTaskHelper(gameState, {
        taskType: 'quest',
        id: questId,
        completionTime: new Date()
      });
      
      // Update game state
      this.gameStates.set(userId, result.user);
      
      return {
        gameState: result.user,
        xpGained: result.xpGained
      };
    }

    // If not all tasks complete, just update the task
    this.gameStates.set(userId, gameState);
    return {
      gameState,
      xpGained: 0
    };
  }

  async completeStreak(userId: number, streakId: string): Promise<{gameState: GameUser, xpGained: number}> {
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    // Process streak completion
    const { completeTask: completeTaskHelper } = await import('@shared/game');
    const result = completeTaskHelper(gameState, {
      taskType: 'streak',
      id: streakId,
      completionTime: new Date()
    });
    
    // Update game state
    this.gameStates.set(userId, result.user);
    
    return {
      gameState: result.user,
      xpGained: result.xpGained
    };
  }

  async completeDungeon(userId: number, dungeonId: string): Promise<{gameState: GameUser, xpGained: number}> {
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    // Process dungeon completion
    const { completeTask: completeTaskHelper } = await import('@shared/game');
    const result = completeTaskHelper(gameState, {
      taskType: 'dungeon',
      id: dungeonId,
      completionTime: new Date()
    });
    
    // Update game state
    this.gameStates.set(userId, result.user);
    
    return {
      gameState: result.user,
      xpGained: result.xpGained
    };
  }

  async createQuest(userId: number, questData: any): Promise<GameUser> {
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const { createCustomQuest } = await import('@shared/game');
    const updatedState = createCustomQuest(gameState, 
      questData.name, 
      questData.description, 
      questData.type, 
      questData.requirements, 
      questData.xpReward,
      questData.itemReward,
      questData.skillReward,
      questData.deadline
    );
    
    // Update game state
    this.gameStates.set(userId, updatedState);
    return updatedState;
  }

  async createDungeon(userId: number, dungeonData: any): Promise<GameUser> {
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const { createDungeonRun } = await import('@shared/game');
    const updatedState = createDungeonRun(
      gameState,
      dungeonData.name,
      dungeonData.description,
      dungeonData.duration,
      dungeonData.rewards
    );
    
    // Update game state
    this.gameStates.set(userId, updatedState);
    return updatedState;
  }

  async createStreak(userId: number, streakData: any): Promise<GameUser> {
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const { createStreak } = await import('@shared/game');
    const updatedState = createStreak(
      gameState,
      streakData.name,
      streakData.description
    );
    
    // Update game state
    this.gameStates.set(userId, updatedState);
    return updatedState;
  }
}

// Database storage implementation
export class DbStorage implements IStorage {
  private sql;
  private db;

  constructor() {
    // Initialize database connection
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not found, using in-memory storage as fallback");
      return;
    }
    
    try {
      this.sql = neon(process.env.DATABASE_URL);
      // Fix the drizzle initialization
      this.db = drizzle(this.sql);
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) return memStorage.getUser(id);
    
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return memStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) return memStorage.getUserByUsername(username);
    
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return memStorage.getUserByUsername(username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.db) return memStorage.createUser(insertUser);
    
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      return memStorage.createUser(insertUser);
    }
  }

  async getUserGameState(userId: number): Promise<GameUser | undefined> {
    if (!this.db) return memStorage.getUserGameState(userId);
    
    try {
      const result = await this.db.select().from(gameStates).where(eq(gameStates.userId, userId)).limit(1);
      // Fix the type casting issue
      return result[0]?.data as GameUser | undefined;
    } catch (error) {
      console.error("Error getting game state:", error);
      return memStorage.getUserGameState(userId);
    }
  }

  async createUserGameState(userId: number, gameState: GameUser): Promise<void> {
    if (!this.db) return memStorage.createUserGameState(userId, gameState);
    
    try {
      await this.db.insert(gameStates).values({
        userId,
        data: gameState as any
      });
    } catch (error) {
      console.error("Error creating game state:", error);
      return memStorage.createUserGameState(userId, gameState);
    }
  }

  async updateUserGameState(userId: number, gameState: GameUser): Promise<void> {
    if (!this.db) return memStorage.updateUserGameState(userId, gameState);
    
    try {
      await this.db.update(gameStates)
        .set({ data: gameState as any })
        .where(eq(gameStates.userId, userId));
    } catch (error) {
      console.error("Error updating game state:", error);
      return memStorage.updateUserGameState(userId, gameState);
    }
  }

  async resetUserGameState(userId: number, username: string): Promise<GameUser> {
    if (!this.db) return memStorage.resetUserGameState(userId, username);
    
    const { createInitialUserState } = await import('@shared/game');
    const newState = createInitialUserState(userId, username);
    
    try {
      await this.db.update(gameStates)
        .set({ data: newState as any })
        .where(eq(gameStates.userId, userId));
      return newState;
    } catch (error) {
      console.error("Error resetting game state:", error);
      return memStorage.resetUserGameState(userId, username);
    }
  }

  // For task completion methods, get the current state, update in memory, then save to database
  async completeQuestTask(userId: number, questId: string, taskId: string): Promise<{gameState: GameUser, xpGained: number}> {
    if (!this.db) return memStorage.completeQuestTask(userId, questId, taskId);
    
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const quest = gameState.quests.find(q => q.id === questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    const task = quest.requirements.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Mark task as complete
    task.isComplete = true;

    // Check if all tasks are complete to mark quest as complete
    const allTasksComplete = quest.requirements.every(t => t.isComplete);
    let xpGained = 0;

    if (allTasksComplete && !quest.isComplete) {
      quest.isComplete = true;
      xpGained = quest.xpReward;
      
      // Add XP to user
      const { completeTask: completeTaskHelper } = await import('@shared/game');
      const result = completeTaskHelper(gameState, {
        taskType: 'quest',
        id: questId,
        completionTime: new Date()
      });
      
      // Update game state in database
      await this.updateUserGameState(userId, result.user);
      
      return {
        gameState: result.user,
        xpGained: result.xpGained
      };
    }

    // If not all tasks complete, just update the task
    await this.updateUserGameState(userId, gameState);
    return {
      gameState,
      xpGained: 0
    };
  }

  async completeStreak(userId: number, streakId: string): Promise<{gameState: GameUser, xpGained: number}> {
    if (!this.db) return memStorage.completeStreak(userId, streakId);
    
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    // Process streak completion
    const { completeTask: completeTaskHelper } = await import('@shared/game');
    const result = completeTaskHelper(gameState, {
      taskType: 'streak',
      id: streakId,
      completionTime: new Date()
    });
    
    // Update game state in database
    await this.updateUserGameState(userId, result.user);
    
    return {
      gameState: result.user,
      xpGained: result.xpGained
    };
  }

  async completeDungeon(userId: number, dungeonId: string): Promise<{gameState: GameUser, xpGained: number}> {
    if (!this.db) return memStorage.completeDungeon(userId, dungeonId);
    
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    // Process dungeon completion
    const { completeTask: completeTaskHelper } = await import('@shared/game');
    const result = completeTaskHelper(gameState, {
      taskType: 'dungeon',
      id: dungeonId,
      completionTime: new Date()
    });
    
    // Update game state in database
    await this.updateUserGameState(userId, result.user);
    
    return {
      gameState: result.user,
      xpGained: result.xpGained
    };
  }

  async createQuest(userId: number, questData: any): Promise<GameUser> {
    if (!this.db) return memStorage.createQuest(userId, questData);
    
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const { createCustomQuest } = await import('@shared/game');
    const updatedState = createCustomQuest(gameState, 
      questData.name, 
      questData.description, 
      questData.type, 
      questData.requirements, 
      questData.xpReward,
      questData.itemReward,
      questData.skillReward,
      questData.deadline
    );
    
    // Update game state in database
    await this.updateUserGameState(userId, updatedState);
    return updatedState;
  }

  async createDungeon(userId: number, dungeonData: any): Promise<GameUser> {
    if (!this.db) return memStorage.createDungeon(userId, dungeonData);
    
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const { createDungeonRun } = await import('@shared/game');
    const updatedState = createDungeonRun(
      gameState,
      dungeonData.name,
      dungeonData.description,
      dungeonData.duration,
      dungeonData.rewards
    );
    
    // Update game state in database
    await this.updateUserGameState(userId, updatedState);
    return updatedState;
  }

  async createStreak(userId: number, streakData: any): Promise<GameUser> {
    if (!this.db) return memStorage.createStreak(userId, streakData);
    
    const gameState = await this.getUserGameState(userId);
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const { createStreak } = await import('@shared/game');
    const updatedState = createStreak(
      gameState,
      streakData.name,
      streakData.description
    );
    
    // Update game state in database
    await this.updateUserGameState(userId, updatedState);
    return updatedState;
  }
}

// Keep the in-memory storage as a fallback
const memStorage = new MemStorage();

// Export the database storage implementation
export const storage = new DbStorage();
