import { v4 as uuidv4 } from 'uuid';

// Game data types and helper functions
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

// Add XP to user and check for level up
export const addXP = (user: User, xp: number): { user: User, levelUpEvent: LevelUpEvent | null } => {
  // Add XP to current total
  const updatedUser = {
    ...user,
    currentXP: user.currentXP + xp
  };
  
  // Check for level up
  return calculateLevelUp(updatedUser);
};

// Complete a task and get rewards
export const completeTask = (user: User, data: TaskCompletionData): { user: User, xpGained: number, levelUpEvent: LevelUpEvent | null } => {
  let xpGained = 0;
  let updatedUser = { ...user };
  
  // Process based on task type
  switch (data.taskType) {
    case 'quest':
      // Find the quest
      const questIndex = user.quests.findIndex(q => q.id === data.id);
      if (questIndex >= 0) {
        const quest = user.quests[questIndex];
        
        // If the quest has a task ID, mark that task as complete
        if (data.taskId) {
          const taskIndex = quest.requirements.findIndex(t => t.id === data.taskId);
          if (taskIndex >= 0) {
            // Mark task complete
            const updatedRequirements = [...quest.requirements];
            updatedRequirements[taskIndex] = {
              ...updatedRequirements[taskIndex],
              isComplete: true
            };
            
            // Check if all tasks are complete
            const allComplete = updatedRequirements.every(t => t.isComplete);
            
            // If all complete, mark quest complete and award XP
            if (allComplete && !quest.isComplete) {
              xpGained = quest.xpReward;
              
              // Update quest in user data
              const updatedQuests = [...user.quests];
              updatedQuests[questIndex] = {
                ...quest,
                requirements: updatedRequirements,
                isComplete: true
              };
              
              updatedUser = {
                ...updatedUser,
                quests: updatedQuests
              };
            } else {
              // Just update the task
              const updatedQuests = [...user.quests];
              updatedQuests[questIndex] = {
                ...quest,
                requirements: updatedRequirements
              };
              
              updatedUser = {
                ...updatedUser,
                quests: updatedQuests
              };
            }
          }
        } else if (!quest.isComplete) {
          // If no task ID, complete the whole quest if not already complete
          xpGained = quest.xpReward;
          
          // Update quest in user data
          const updatedQuests = [...user.quests];
          updatedQuests[questIndex] = {
            ...quest,
            requirements: quest.requirements.map(t => ({ ...t, isComplete: true })),
            isComplete: true
          };
          
          updatedUser = {
            ...updatedUser,
            quests: updatedQuests
          };
        }
      }
      break;
      
    case 'streak':
      // Find the streak
      const streakIndex = user.streaks.findIndex(s => s.id === data.id);
      if (streakIndex >= 0) {
        const streak = user.streaks[streakIndex];
        
        // Check if streak is already completed today
        const lastCompletedDate = new Date(streak.lastCompleted);
        const completionDate = new Date(data.completionTime);
        const isSameDay = 
          lastCompletedDate.getDate() === completionDate.getDate() &&
          lastCompletedDate.getMonth() === completionDate.getMonth() &&
          lastCompletedDate.getFullYear() === completionDate.getFullYear();
        
        if (!isSameDay) {
          // Check if streak was completed yesterday to maintain or increase
          const yesterday = new Date(completionDate);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const isYesterday = 
            lastCompletedDate.getDate() === yesterday.getDate() &&
            lastCompletedDate.getMonth() === yesterday.getMonth() &&
            lastCompletedDate.getFullYear() === yesterday.getFullYear();
          
          // Update streak
          const updatedDays = isYesterday ? streak.days + 1 : 1;
          xpGained = 10 + Math.min(updatedDays * 2, 50); // Base XP + bonus for streak length
          
          // Update streak in user data
          const updatedStreaks = [...user.streaks];
          updatedStreaks[streakIndex] = {
            ...streak,
            days: updatedDays,
            lastCompleted: data.completionTime,
            isActive: true
          };
          
          updatedUser = {
            ...updatedUser,
            streaks: updatedStreaks
          };
        }
      }
      break;
      
    case 'dungeon':
      // Find the dungeon run
      const dungeonIndex = user.dungeonRuns.findIndex(d => d.id === data.id);
      if (dungeonIndex >= 0) {
        const dungeon = user.dungeonRuns[dungeonIndex];
        
        // Complete the dungeon if not already complete
        if (!dungeon.completed) {
          xpGained = dungeon.rewards.xp;
          
          // Update dungeon in user data
          const updatedDungeons = [...user.dungeonRuns];
          updatedDungeons[dungeonIndex] = {
            ...dungeon,
            completed: true,
            completedAt: data.completionTime
          };
          
          updatedUser = {
            ...updatedUser,
            dungeonRuns: updatedDungeons
          };
        }
      }
      break;
  }
  
  // Add XP and check for level up
  const { user: finalUser, levelUpEvent } = addXP(updatedUser, xpGained);
  
  // Check for achievements
  const userWithAchievements = checkAchievements(finalUser);
  
  return {
    user: userWithAchievements,
    xpGained,
    levelUpEvent
  };
};

// Create a custom quest
export const createCustomQuest = (
  user: User, 
  name: string, 
  description: string, 
  type: 'daily' | 'weekly' | 'achievement' | 'storyline', 
  requirements: string[], 
  xpReward: number, 
  itemReward?: Item, 
  skillReward?: Skill, 
  deadline?: Date
): User => {
  const newQuest: Quest = {
    id: `quest-${uuidv4()}`,
    name,
    description,
    type,
    requirements: requirements.map(req => ({
      id: uuidv4(),
      description: req,
      isComplete: false
    })),
    xpReward,
    itemReward,
    skillReward,
    isComplete: false,
    deadline
  };
  
  return {
    ...user,
    quests: [...user.quests, newQuest]
  };
};

// Create a dungeon run
export const createDungeonRun = (
  user: User,
  name: string,
  description: string,
  duration: number,
  rewards: { xp: number, items?: Item[] }
): User => {
  const newDungeon: DungeonRun = {
    id: `dungeon-${uuidv4()}`,
    name,
    description,
    duration,
    completed: false,
    rewards,
    createdAt: new Date()
  };
  
  return {
    ...user,
    dungeonRuns: [...user.dungeonRuns, newDungeon]
  };
};

// Create a streak
export const createStreak = (
  user: User,
  name: string,
  description: string
): User => {
  const newStreak: Streak = {
    id: `streak-${uuidv4()}`,
    name,
    description,
    days: 0,
    lastCompleted: new Date(new Date().setDate(new Date().getDate() - 1)),
    isActive: true
  };
  
  return {
    ...user,
    streaks: [...user.streaks, newStreak]
  };
};

// Check for achievement completions
export const checkAchievements = (user: User): User => {
  // Create a copy of achievements to modify
  const updatedAchievements = [...user.achievements];
  let achievementsChanged = false;
  
  // Check level 2 achievement
  const level2Achievement = updatedAchievements.find(a => a.id === 'achievement-first-level');
  if (level2Achievement && !level2Achievement.isUnlocked && user.level >= 2) {
    const index = updatedAchievements.findIndex(a => a.id === 'achievement-first-level');
    updatedAchievements[index] = {
      ...level2Achievement,
      isUnlocked: true,
      unlockedAt: new Date()
    };
    achievementsChanged = true;
  }
  
  // Check streak achievement
  const streakAchievement = updatedAchievements.find(a => a.id === 'achievement-streak-3');
  if (streakAchievement && !streakAchievement.isUnlocked) {
    const hasStreak3 = user.streaks.some(s => s.days >= 3);
    if (hasStreak3) {
      const index = updatedAchievements.findIndex(a => a.id === 'achievement-streak-3');
      updatedAchievements[index] = {
        ...streakAchievement,
        isUnlocked: true,
        unlockedAt: new Date()
      };
      achievementsChanged = true;
    }
  }
  
  // Only update user if achievements changed
  if (achievementsChanged) {
    return {
      ...user,
      achievements: updatedAchievements
    };
  }
  
  return user;
};

// Toggle equip/unequip an item
export const toggleEquipItem = (user: User, itemId: string): User => {
  const itemIndex = user.inventory.findIndex(item => item.id === itemId);
  if (itemIndex === -1) return user;
  
  const item = user.inventory[itemIndex];
  const updatedInventory = [...user.inventory];
  
  // Toggle the equipped state
  updatedInventory[itemIndex] = {
    ...item,
    isEquipped: !item.isEquipped
  };
  
  return {
    ...user,
    inventory: updatedInventory
  };
};

// Toggle activate/deactivate a skill
export const toggleSkill = (user: User, skillId: string): User => {
  const skillIndex = user.skills.findIndex(skill => skill.id === skillId);
  if (skillIndex === -1) return user;
  
  const skill = user.skills[skillIndex];
  
  // Only toggle if skill is unlocked
  if (!skill.unlocked) return user;
  
  const updatedSkills = [...user.skills];
  
  // Toggle the active state
  updatedSkills[skillIndex] = {
    ...skill,
    isActive: !skill.isActive
  };
  
  return {
    ...user,
    skills: updatedSkills
  };
};

// Helper for rarity color
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-300';
    case 'uncommon': return 'text-green-400';
    case 'rare': return 'text-blue-400';
    case 'epic': return 'text-purple-400';
    case 'legendary': return 'text-yellow-400';
    default: return 'text-gray-300';
  }
};

// Helper for skill type color
export const getSkillTypeColor = (type: string): string => {
  switch (type) {
    case 'combat': return 'text-red-400';
    case 'intellect': return 'text-blue-400';
    case 'utility': return 'text-green-400';
    case 'special': return 'text-purple-400';
    default: return 'text-gray-300';
  }
};

// Helper for XP progress percentage
export const getXPProgressPercentage = (current: number, required: number): number => {
  return Math.min(Math.round((current / required) * 100), 100);
};

// Helper for stat icon
export const getStatIcon = (statType: StatType): string => {
  switch (statType) {
    case 'strength': return 'dumbbell';
    case 'intelligence': return 'brain';
    case 'endurance': return 'heart';
    case 'willpower': return 'mountain';
    case 'charisma': return 'users';
    case 'dexterity': return 'move';
    default: return 'circle';
  }
};
