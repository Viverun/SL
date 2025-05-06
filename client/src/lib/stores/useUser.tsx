import { create } from "zustand";
import { User } from "@shared/game";
import { apiRequest } from "@/lib/queryClient";

interface UserState {
  // User authentication state
  isAuthenticated: boolean;
  userId: number | null;
  username: string | null;
  
  // Game data
  gameData: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchGameData: () => Promise<void>;
  updateGameData: (data: User) => Promise<void>;
  completeTask: (taskType: 'quest' | 'streak' | 'dungeon', id: string, taskId?: string) => Promise<void>;
}

export const useUser = create<UserState>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  userId: null,
  username: null,
  gameData: null,
  isLoading: false,
  error: null,
  
  // User authentication actions
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    
    try {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await res.json();
      
      set({ 
        isAuthenticated: true,
        userId: userData.id, 
        username: userData.username,
        isLoading: false 
      });
      
      // After login, fetch game data
      await get().fetchGameData();
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to login' 
      });
      throw err;
    }
  },
  
  register: async (username, password) => {
    set({ isLoading: true, error: null });
    
    try {
      // Register the user
      await apiRequest('POST', '/api/auth/register', { username, password });
      
      // After registration, log the user in
      await get().login(username, password);
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to register' 
      });
      throw err;
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('POST', '/api/auth/logout');
      
      set({ 
        isAuthenticated: false,
        userId: null,
        username: null,
        gameData: null,
        isLoading: false
      });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to logout' 
      });
      throw err;
    }
  },
  
  // Game data actions
  fetchGameData: async () => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const res = await apiRequest('GET', '/api/game/data');
      const gameData = await res.json();
      
      set({ gameData, isLoading: false });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to fetch game data' 
      });
      throw err;
    }
  },
  
  updateGameData: async (data) => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    
    set({ isLoading: true, error: null });
    
    try {
      await apiRequest('PUT', '/api/game/data', data);
      
      set({ gameData: data, isLoading: false });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to update game data' 
      });
      throw err;
    }
  },
  
  completeTask: async (taskType, id, taskId) => {
    const { isAuthenticated } = get();
    if (!isAuthenticated) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const res = await apiRequest('POST', '/api/game/completeTask', {
        taskType,
        id,
        taskId,
        completionTime: new Date()
      });
      
      const { gameState } = await res.json();
      
      set({ gameData: gameState, isLoading: false });
    } catch (err: any) {
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to complete task' 
      });
      throw err;
    }
  }
}));