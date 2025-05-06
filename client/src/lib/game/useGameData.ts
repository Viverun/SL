import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Stats, 
  Skill, 
  Item, 
  Quest, 
  QuestTask, 
  Streak, 
  TaskCompletionData, 
  LevelUpEvent,
  GameTab,
  AnalyticsData
} from './gameTypes';
import { initialGameState } from './initialGameState';
import { 
  addXP, 
  completeTask, 
  createCustomQuest, 
  createDungeonRun, 
  createStreak,
  checkAchievements,
  toggleEquipItem,
  toggleSkill
} from './gameHelpers';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

interface GameState {
  user: User;
  isLoading: boolean;
  activeTab: GameTab;
  levelUpNotification: LevelUpEvent | null;
  analyticsData: AnalyticsData;
  
  // Actions
  setUser: (user: User) => void;
  setActiveTab: (tab: GameTab) => void;
  addExperience: (xp: number) => void;
  completeTaskAction: (data: TaskCompletionData) => void;
  createQuest: (name: string, description: string, type: 'daily' | 'weekly' | 'achievement' | 'storyline', tasks: string[], xpReward: number, deadline?: Date) => void;
  createDungeon: (name: string, description: string, duration: number, xpReward: number) => void;
  createStreakHabit: (name: string, description: string) => void;
  dismissLevelUpNotification: () => void;
  toggleEquip: (itemId: string) => void;
  toggleSkillActive: (skillId: string) => void;
  resetGameState: () => void;
  
  // For development/testing
  _devAddSkill: (skill: Skill) => void;
  _devAddItem: (item: Item) => void;
}

// Initial analytics data
const initialAnalyticsData: AnalyticsData = {
  xpGained: {
    daily: Array(7).fill(0),
    weekly: Array(4).fill(0),
    monthly: Array(12).fill(0)
  },
  questsCompleted: 0,
  dungeonRunsCompleted: 0,
  streakLongest: 0,
  skillsLearned: 0,
  levelUps: 0
};

export const useGameData = create<GameState>()(
  persist(
    (set, get) => ({
      user: initialGameState,
      isLoading: false,
      activeTab: 'dashboard',
      levelUpNotification: null,
      analyticsData: initialAnalyticsData,
      
      setUser: (user) => set({ user }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      addExperience: (xp) => {
        const { user, levelUpEvent } = addXP(get().user, xp);
        
        // Update analytics data
        const analyticsData = { ...get().analyticsData };
        analyticsData.xpGained.daily[new Date().getDay()] += xp;
        
        if (levelUpEvent) {
          analyticsData.levelUps += 1;
        }
        
        // Check for achievements
        const updatedUser = checkAchievements(user);
        
        set({ 
          user: updatedUser, 
          levelUpNotification: levelUpEvent,
          analyticsData
        });
      },
      
      completeTaskAction: (data) => {
        const { user, xpGained, levelUpEvent } = completeTask(get().user, data);
        
        // Update analytics
        const analyticsData = { ...get().analyticsData };
        
        if (xpGained > 0) {
          analyticsData.xpGained.daily[new Date().getDay()] += xpGained;
          
          if (data.taskType === 'quest') {
            analyticsData.questsCompleted += 1;
          } else if (data.taskType === 'dungeon') {
            analyticsData.dungeonRunsCompleted += 1;
          } else if (data.taskType === 'streak') {
            const streak = user.streaks.find(s => s.id === data.id);
            if (streak && streak.days > analyticsData.streakLongest) {
              analyticsData.streakLongest = streak.days;
            }
          }
          
          if (levelUpEvent) {
            analyticsData.levelUps += 1;
          }
        }
        
        // Check for achievements
        const updatedUser = checkAchievements(user);
        
        set({ 
          user: updatedUser, 
          levelUpNotification: levelUpEvent ? levelUpEvent : get().levelUpNotification,
          analyticsData
        });
      },
      
      createQuest: (name, description, type, tasks, xpReward, deadline) => {
        const updatedUser = createCustomQuest(get().user, name, description, type, tasks, xpReward, deadline);
        set({ user: updatedUser });
      },
      
      createDungeon: (name, description, duration, xpReward) => {
        const updatedUser = createDungeonRun(get().user, name, description, duration, xpReward);
        set({ user: updatedUser });
      },
      
      createStreakHabit: (name, description) => {
        const updatedUser = createStreak(get().user, name, description);
        set({ user: updatedUser });
      },
      
      dismissLevelUpNotification: () => {
        set({ levelUpNotification: null });
      },
      
      toggleEquip: (itemId) => {
        const updatedUser = toggleEquipItem(get().user, itemId);
        set({ user: updatedUser });
      },
      
      toggleSkillActive: (skillId) => {
        const updatedUser = toggleSkill(get().user, skillId);
        set({ user: updatedUser });
      },
      
      resetGameState: () => {
        set({ 
          user: initialGameState,
          levelUpNotification: null,
          analyticsData: initialAnalyticsData
        });
      },
      
      // Development helpers
      _devAddSkill: (skill) => {
        const updatedUser = {
          ...get().user,
          skills: [...get().user.skills, skill]
        };
        set({ user: updatedUser });
        
        // Update analytics
        const analyticsData = { ...get().analyticsData };
        analyticsData.skillsLearned += 1;
        set({ analyticsData });
      },
      
      _devAddItem: (item) => {
        const updatedUser = {
          ...get().user,
          inventory: [...get().user.inventory, item]
        };
        set({ user: updatedUser });
      }
    }),
    {
      name: 'solo-leveling-game-data'
    }
  )
);
