import { create } from "zustand";
import { User } from "@shared/game";
import { apiRequest, storeAuthToken, getAuthToken, clearAuthToken } from "@/lib/queryClient";

// Use the query client's token management functions instead of local functions
const saveToken = (token: string) => {
  console.log('Saving token to localStorage:', token.substring(0, 10) + '...');
  storeAuthToken(token);
  
  // Immediately verify the token was saved correctly
  const savedToken = getAuthToken();
  if (savedToken !== token) {
    console.error('Token verification failed - saved token does not match!');
  } else {
    console.log('Token saved successfully and verified');
  }
};

const removeToken = () => {
  console.log('Removing token from localStorage');
  clearAuthToken();
};

const getToken = () => {
  const token = getAuthToken();
  console.log('Retrieved token from localStorage:', token ? 'exists' : 'missing');
  return token;
};

// Check if token exists to determine initial auth state
const hasInitialToken = !!getToken();

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
  // Initial state - check for existing token
  isAuthenticated: hasInitialToken,
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
      
      // Save JWT token in localStorage
      if (userData.token) {
        saveToken(userData.token);
      }
      
      set({ 
        isAuthenticated: true,
        userId: userData.user.id, 
        username: userData.user.username,
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
      const res = await apiRequest('POST', '/api/auth/register', { username, password });
      const userData = await res.json();
      
      // Save JWT token in localStorage
      if (userData.token) {
        console.log('Token from registration:', userData.token.substring(0, 10) + '...'); // Debug token
        saveToken(userData.token);
      } else {
        console.error('No token received from registration');
      }
      
      set({ 
        isAuthenticated: true,
        userId: userData.user.id, 
        username: userData.user.username,
        isLoading: false 
      });
      
      // Wait a moment to ensure the token is saved before fetching data
      setTimeout(async () => {
        try {
          await get().fetchGameData();
        } catch (err) {
          console.error('Error fetching game data after registration:', err);
        }
      }, 500);
      
    } catch (err: any) {
      console.error('Registration error:', err);
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
      
      // Remove token
      removeToken();
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
    if (!isAuthenticated) {
      console.log('Not fetching game data - user not authenticated');
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching game data - auth token exists:', !!getToken());
      const res = await apiRequest('GET', '/api/game/data');
      const gameData = await res.json();
      
      console.log('Game data fetched successfully');
      set({ gameData, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching game data:', err);
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