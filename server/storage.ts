import { users, type User, type InsertUser } from "@shared/schema";
import { User as GameUser } from "@shared/game";

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

export const storage = new MemStorage();
