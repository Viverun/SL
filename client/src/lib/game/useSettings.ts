import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameSettings } from './gameTypes';
import { useAudio } from '../stores/useAudio';

interface SettingsState {
  settings: GameSettings;
  
  // Actions
  toggleDarkMode: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleAnimations: () => void;
  toggleAutoSave: () => void;
  setTextSize: (size: 'small' | 'medium' | 'large') => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  resetSettings: () => void;
}

const initialSettings: GameSettings = {
  darkMode: true,
  soundEnabled: false,
  musicEnabled: false,
  animationsEnabled: true,
  autoSave: true,
  textSize: 'medium',
  accessibility: {
    highContrast: false,
    reduceMotion: false
  }
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: initialSettings,
      
      toggleDarkMode: () => {
        const newSettings = {
          ...get().settings,
          darkMode: !get().settings.darkMode
        };
        
        // Apply dark mode
        if (newSettings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        set({ settings: newSettings });
      },
      
      toggleSound: () => {
        const newSettings = {
          ...get().settings,
          soundEnabled: !get().settings.soundEnabled
        };
        
        // Toggle audio
        const audioStore = useAudio.getState();
        audioStore.toggleMute();
        
        set({ settings: newSettings });
      },
      
      toggleMusic: () => {
        const newSettings = {
          ...get().settings,
          musicEnabled: !get().settings.musicEnabled
        };
        
        // Toggle background music
        const audioStore = useAudio.getState();
        const { backgroundMusic, isMuted } = audioStore;
        
        if (backgroundMusic) {
          if (newSettings.musicEnabled && isMuted) {
            backgroundMusic.play().catch(err => console.log('Music play prevented:', err));
          } else {
            backgroundMusic.pause();
          }
        }
        
        set({ settings: newSettings });
      },
      
      toggleAnimations: () => {
        const newSettings = {
          ...get().settings,
          animationsEnabled: !get().settings.animationsEnabled
        };
        
        set({ settings: newSettings });
      },
      
      toggleAutoSave: () => {
        const newSettings = {
          ...get().settings,
          autoSave: !get().settings.autoSave
        };
        
        set({ settings: newSettings });
      },
      
      setTextSize: (size) => {
        const newSettings = {
          ...get().settings,
          textSize: size
        };
        
        // Apply text size
        const rootElem = document.documentElement;
        rootElem.style.fontSize = size === 'small' 
          ? '14px' 
          : size === 'large' 
            ? '18px' 
            : '16px';
        
        set({ settings: newSettings });
      },
      
      toggleHighContrast: () => {
        const newSettings = {
          ...get().settings,
          accessibility: {
            ...get().settings.accessibility,
            highContrast: !get().settings.accessibility.highContrast
          }
        };
        
        // Apply high contrast
        if (newSettings.accessibility.highContrast) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
        
        set({ settings: newSettings });
      },
      
      toggleReduceMotion: () => {
        const newSettings = {
          ...get().settings,
          accessibility: {
            ...get().settings.accessibility,
            reduceMotion: !get().settings.accessibility.reduceMotion
          }
        };
        
        // Apply reduced motion
        if (newSettings.accessibility.reduceMotion) {
          document.documentElement.classList.add('reduce-motion');
        } else {
          document.documentElement.classList.remove('reduce-motion');
        }
        
        set({ settings: newSettings });
      },
      
      resetSettings: () => {
        // Reset to defaults
        set({ settings: initialSettings });
        
        // Apply defaults
        if (initialSettings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        document.documentElement.classList.remove('high-contrast', 'reduce-motion');
        document.documentElement.style.fontSize = '16px';
      }
    }),
    {
      name: 'solo-leveling-settings'
    }
  )
);

// Apply settings on initial load
export const initializeSettings = () => {
  const { settings } = useSettings.getState();
  
  // Apply dark mode
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Apply text size
  const rootElem = document.documentElement;
  rootElem.style.fontSize = settings.textSize === 'small' 
    ? '14px' 
    : settings.textSize === 'large' 
      ? '18px' 
      : '16px';
  
  // Apply high contrast
  if (settings.accessibility.highContrast) {
    document.documentElement.classList.add('high-contrast');
  }
  
  // Apply reduced motion
  if (settings.accessibility.reduceMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
};
