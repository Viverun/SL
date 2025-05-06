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
