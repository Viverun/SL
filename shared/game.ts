import { v4 as uuidv4 } from 'uuid';

// Game data types
export interface User {
  id: number;
  username: string;
  level: number;
  currentXP: number;
  requiredXP: number;
  stats: Stats;
  achievements: Achievement[];
  skills: Skill[];
  inventory: Item[];
  quests: Quest[];
  streaks: Streak[];
  dungeonRuns: DungeonRun[];
}

export interface Stats {
  strength: number;
  intelligence: number;
  endurance: number;
  willpower: number;
  charisma: number;
  dexterity: number;
}

export type StatType = keyof Stats;

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  type: 'combat' | 'intellect' | 'utility' | 'special';
  effect: string;
  icon: string;
  unlocked: boolean;
  parentSkillId?: string;
  isActive: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effect: string;
  icon: string;
  isEquipped: boolean;
  statBoosts?: Partial<Stats>;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement' | 'storyline';
  requirements: QuestTask[];
  xpReward: number;
  itemReward?: Item;
  skillReward?: Skill;
  isComplete: boolean;
  deadline?: Date;
}

export interface QuestTask {
  id: string;
  description: string;
  isComplete: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface Streak {
  id: string;
  name: string;
  description: string;
  days: number;
  lastCompleted: Date;
  isActive: boolean;
}

export interface DungeonRun {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  completed: boolean;
  rewards: {
    xp: number;
    items?: Item[];
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskCompletionData {
  taskType: 'quest' | 'streak' | 'dungeon';
  id: string;
  taskId?: string; // For quest tasks
  completionTime: Date;
}

export interface LevelUpEvent {
  oldLevel: number;
  newLevel: number;
  newStats: Stats;
  unlockedSkills?: Skill[];
  unlockedItems?: Item[];
}

export interface GameSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  animationsEnabled: boolean;
  autoSave: boolean;
  textSize: 'small' | 'medium' | 'large';
  accessibility: {
    highContrast: boolean;
    reduceMotion: boolean;
  };
}

export interface AnalyticsData {
  xpGained: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  questsCompleted: number;
  dungeonRunsCompleted: number;
  streakLongest: number;
  skillsLearned: number;
  levelUps: number;
}

export type GameTab = 
  | 'dashboard' 
  | 'quests' 
  | 'inventory' 
  | 'skills' 
  | 'dungeons' 
  | 'stats' 
  | 'streaks'
  | 'analytics'
  | 'settings';

// Initial stats for a new user
export const initialStats: Stats = {
  strength: 5,
  intelligence: 5,
  endurance: 5,
  willpower: 5,
  charisma: 5,
  dexterity: 5
};

// Starting skills
export const initialSkills: Skill[] = [
  {
    id: 'skill-basic-fitness',
    name: 'Basic Fitness',
    description: 'The foundation of physical development',
    level: 1,
    type: 'combat',
    effect: 'Increases strength gains by 5%',
    icon: 'dumbbell',
    unlocked: true,
    isActive: true
  },
  {
    id: 'skill-focused-study',
    name: 'Focused Study',
    description: 'Ability to concentrate on learning tasks',
    level: 1,
    type: 'intellect',
    effect: 'Increases intelligence gains by 5%',
    icon: 'book-open',
    unlocked: true,
    isActive: true
  },
  {
    id: 'skill-basic-meditation',
    name: 'Basic Meditation',
    description: 'Simple meditation techniques for mental clarity',
    level: 1,
    type: 'utility',
    effect: 'Increases willpower gains by 5%',
    icon: 'brain',
    unlocked: true,
    isActive: true
  }
];

// Starting items
export const initialItems: Item[] = [
  {
    id: 'item-novice-journal',
    name: 'Novice Journal',
    description: 'A simple journal to track your progress',
    type: 'accessory',
    rarity: 'common',
    effect: 'Increases XP gain by 2%',
    icon: 'book',
    isEquipped: true,
    statBoosts: {
      intelligence: 1
    }
  },
  {
    id: 'item-basic-training-gear',
    name: 'Basic Training Gear',
    description: 'Simple workout clothes for beginners',
    type: 'armor',
    rarity: 'common',
    effect: 'Increases physical activity XP by 3%',
    icon: 'shirt',
    isEquipped: true,
    statBoosts: {
      strength: 1,
      endurance: 1
    }
  }
];

// Starting quests
export const initialQuests: Quest[] = [
  {
    id: 'quest-tutorial',
    name: 'Awakening',
    description: 'Complete the tutorial to understand your new powers',
    type: 'storyline',
    requirements: [
      {
        id: uuidv4(),
        description: 'Create your first task',
        isComplete: false
      },
      {
        id: uuidv4(),
        description: 'Complete your first task',
        isComplete: false
      },
      {
        id: uuidv4(),
        description: 'View your skill tree',
        isComplete: false
      }
    ],
    xpReward: 50,
    isComplete: false
  },
  {
    id: 'quest-daily-routine',
    name: 'Daily Routine',
    description: 'Establish a daily habit to increase your power',
    type: 'daily',
    requirements: [
      {
        id: uuidv4(),
        description: 'Complete one physical activity',
        isComplete: false
      },
      {
        id: uuidv4(),
        description: 'Complete one mental activity',
        isComplete: false
      }
    ],
    xpReward: 30,
    isComplete: false,
    deadline: new Date(new Date().setHours(23, 59, 59, 999))
  }
];

// Starting achievements
export const initialAchievements: Achievement[] = [
  {
    id: 'achievement-awakened',
    name: 'Awakened',
    description: 'Start your journey as a Hunter',
    icon: 'sunrise',
    isUnlocked: true,
    unlockedAt: new Date()
  },
  {
    id: 'achievement-first-level',
    name: 'The Beginning',
    description: 'Reach level 2',
    icon: 'trending-up',
    isUnlocked: false
  },
  {
    id: 'achievement-streak-3',
    name: 'Consistent',
    description: 'Maintain a streak for 3 days',
    icon: 'calendar',
    isUnlocked: false
  }
];

// Starting streaks
export const initialStreaks: Streak[] = [
  {
    id: 'streak-daily-activity',
    name: 'Daily Activity',
    description: 'Complete at least one activity every day',
    days: 0,
    lastCompleted: new Date(new Date().setDate(new Date().getDate() - 1)),
    isActive: true
  }
];

// Initial state for a new user
export const createInitialUserState = (id: number, username: string): User => ({
  id,
  username,
  level: 1,
  currentXP: 0,
  requiredXP: 100,
  stats: initialStats,
  achievements: initialAchievements,
  skills: initialSkills,
  inventory: initialItems,
  quests: initialQuests,
  streaks: initialStreaks,
  dungeonRuns: []
});

// Helper functions
export const getRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateLevelUp = (user: User): { user: User, levelUpEvent: LevelUpEvent | null } => {
  let { level, currentXP, requiredXP, stats } = user;
  let newLevel = level;
  let levelUpEvent: LevelUpEvent | null = null;
  
  // Check if XP is enough for level up
  while (currentXP >= requiredXP) {
    // Level up
    newLevel++;
    currentXP -= requiredXP;
    requiredXP = getRequiredXP(newLevel);
    
    // Increase stats
    const newStats = { ...stats };
    newStats.strength += 1;
    newStats.intelligence += 1;
    newStats.endurance += 1;
    newStats.willpower += 1;
    newStats.charisma += 1;
    newStats.dexterity += 1;
    
    // Record level up event
    levelUpEvent = {
      oldLevel: level,
      newLevel,
      newStats: { ...newStats },
      unlockedSkills: [],
      unlockedItems: []
    };
    
    // Update user stats
    stats = newStats;
    level = newLevel;
  }
  
  // Return updated user and level up event if any
  return {
    user: {
      ...user,
      level,
      currentXP,
      requiredXP,
      stats
    },
    levelUpEvent
  };
};
