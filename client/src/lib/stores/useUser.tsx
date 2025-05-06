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
    console.log('[useUser.login] Attempting login...');
    try {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await res.json();
      if (userData.token) {
        console.log('[useUser.login] Token received from API:', userData.token.substring(0,10) + '...');
        saveToken(userData.token); // This now uses the queryClient's storeAuthToken
        // Verify token immediately after saving
        const verifyToken = getToken(); // This uses queryClient's getAuthToken
        if (verifyToken === userData.token) {
          console.log('[useUser.login] Token successfully saved and verified in localStorage.');
        } else {
          console.error('[useUser.login] CRITICAL: Token verification FAILED after saving. Expected:', userData.token.substring(0,10) + '...', 'Got:', verifyToken ? verifyToken.substring(0,10) + '...' : 'null');
        }
      } else {
        console.error('[useUser.login] CRITICAL: No token received from login API response.');
      }
      set({ 
        isAuthenticated: true,
        userId: userData.user.id, 
        username: userData.user.username,
        isLoading: false 
      });
      console.log('[useUser.login] User state updated. isAuthenticated: true.');
      await get().fetchGameData();
    } catch (err: any) {
      console.error('[useUser.login] Login error:', err);
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to login' 
      });
      throw err;
    }
  },
  
  register: async (username, password) => {
    set({ isLoading: true, error: null });
    console.log('[useUser.register] Attempting registration...');
    try {
      const res = await apiRequest('POST', '/api/auth/register', { username, password });
      const userData = await res.json();
      if (userData.token) {
        console.log('[useUser.register] Token received from API:', userData.token.substring(0,10) + '...');
        saveToken(userData.token); // Uses queryClient's storeAuthToken
        // Verify token immediately
        const verifyToken = getToken(); // Uses queryClient's getAuthToken
        if (verifyToken === userData.token) {
          console.log('[useUser.register] Token successfully saved and verified in localStorage.');
        } else {
          console.error('[useUser.register] CRITICAL: Token verification FAILED. Expected:', userData.token.substring(0,10) + '...', 'Got:', verifyToken ? verifyToken.substring(0,10) + '...' : 'null');
        }
      } else {
        console.error('[useUser.register] CRITICAL: No token received from registration API.');
      }
      set({ 
        isAuthenticated: true,
        userId: userData.user.id, 
        username: userData.user.username,
        isLoading: false 
      });
      console.log('[useUser.register] User state updated. isAuthenticated: true.');
      // Delay slightly before fetching game data to ensure state propagation and token availability
      setTimeout(() => get().fetchGameData(), 100); 
    } catch (err: any) {
      console.error('[useUser.register] Registration error:', err);
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
    console.log(`[useUser.fetchGameData] Initiated. User isAuthenticated: ${isAuthenticated}`);
    if (!isAuthenticated) {
      console.warn('[useUser.fetchGameData] Aborting: User not authenticated.');
      // Attempt to re-check token directly from localStorage just in case zustand state is stale
      const directToken = localStorage.getItem('token');
      if (directToken) {
        console.warn('[useUser.fetchGameData] Stale state? Direct token check FOUND a token. Forcing isAuthenticated to true and retrying fetch.');
        set({ isAuthenticated: true }); // Correct the state
        // Proceed with fetch after state update
        setTimeout(() => get().fetchGameData(), 0); // Re-queue the fetch
        return;
      } else {
        console.warn('[useUser.fetchGameData] Direct token check also found NO token. User is definitely not authenticated.');
        return; // Definitely not authenticated
      }
    }
    set({ isLoading: true, error: null });
    console.log('[useUser.fetchGameData] Fetching game data... Token check:', getToken() ? 'Token exists' : 'Token MISSING');
    try {
      const res = await apiRequest('GET', '/api/game/data'); // apiRequest now has detailed logging
      const gameData = await res.json();
      console.log('[useUser.fetchGameData] Game data fetched successfully.');
      set({ gameData, isLoading: false });
    } catch (err: any) {
      console.error('[useUser.fetchGameData] Error fetching game data:', err);
      set({ 
        isLoading: false, 
        error: err.message || 'Failed to fetch game data' 
      });
      // If 401, it might be a truly expired/invalid token, try to logout
      if (err.message && err.message.includes('401')) {
        console.warn('[useUser.fetchGameData] Received 401, attempting to clear token and logout.');
        get().logout();
      }
      // Do not throw error here to prevent unhandled promise rejections if not caught by UI
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