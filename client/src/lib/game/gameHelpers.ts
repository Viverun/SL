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
  DungeonRun,
  StatType
} from './gameTypes';
import { v4 as uuidv4 } from 'uuid';

// Get XP required for next level based on current level
export const getRequiredXP = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Calculate level up based on XP
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

// Add XP to user
export const addXP = (user: User, xp: number): { user: User, levelUpEvent: LevelUpEvent | null } => {
  const updatedUser = {
    ...user,
    currentXP: user.currentXP + xp
  };
  
  return calculateLevelUp(updatedUser);
};

// Complete a task (quest task, streak, or dungeon)
export const completeTask = (user: User, data: TaskCompletionData): { user: User, xpGained: number, levelUpEvent: LevelUpEvent | null } => {
  let updatedUser = { ...user };
  let xpGained = 0;
  
  switch (data.taskType) {
    case 'quest':
      const questIndex = user.quests.findIndex(q => q.id === data.id);
      if (questIndex >= 0) {
        const quest = { ...user.quests[questIndex] };
        const taskIndex = quest.requirements.findIndex(t => t.id === data.taskId);
        
        if (taskIndex >= 0 && !quest.requirements[taskIndex].isComplete) {
          // Update the task
          const updatedRequirements = [...quest.requirements];
          updatedRequirements[taskIndex] = {
            ...updatedRequirements[taskIndex],
            isComplete: true
          };
          
          // Check if all tasks are complete
          const allComplete = updatedRequirements.every(t => t.isComplete);
          
          // Update the quest
          const updatedQuest = {
            ...quest,
            requirements: updatedRequirements,
            isComplete: allComplete
          };
          
          // If quest is complete, add rewards
          if (allComplete && !quest.isComplete) {
            xpGained = updatedQuest.xpReward;
          }
          
          // Update user quests
          const updatedQuests = [...user.quests];
          updatedQuests[questIndex] = updatedQuest;
          updatedUser = {
            ...updatedUser,
            quests: updatedQuests
          };
        }
      }
      break;
      
    case 'streak':
      const streakIndex = user.streaks.findIndex(s => s.id === data.id);
      if (streakIndex >= 0) {
        const streak = user.streaks[streakIndex];
        const today = new Date();
        const lastCompleted = new Date(streak.lastCompleted);
        
        // Check if this is a new day
        const isNewDay = today.getDate() !== lastCompleted.getDate() || 
                         today.getMonth() !== lastCompleted.getMonth() || 
                         today.getFullYear() !== lastCompleted.getFullYear();
        
        if (isNewDay) {
          // Check if streak continues or resets
          const dayDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
          
          let updatedDays = streak.days;
          if (dayDiff === 1) {
            // Streak continues
            updatedDays += 1;
            xpGained = 10 + Math.floor(updatedDays / 3) * 5; // More XP for longer streaks
          } else if (dayDiff > 1) {
            // Streak resets
            updatedDays = 1;
            xpGained = 10;
          }
          
          // Update streak
          const updatedStreaks = [...user.streaks];
          updatedStreaks[streakIndex] = {
            ...streak,
            days: updatedDays,
            lastCompleted: today,
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
      const dungeonIndex = user.dungeonRuns.findIndex(d => d.id === data.id);
      if (dungeonIndex >= 0 && !user.dungeonRuns[dungeonIndex].completed) {
        const dungeon = user.dungeonRuns[dungeonIndex];
        
        // Mark as completed
        const updatedDungeons = [...user.dungeonRuns];
        updatedDungeons[dungeonIndex] = {
          ...dungeon,
          completed: true,
          completedAt: new Date()
        };
        
        xpGained = dungeon.rewards.xp;
        
        updatedUser = {
          ...updatedUser,
          dungeonRuns: updatedDungeons
        };
      }
      break;
  }
  
  // Add XP if any was gained
  if (xpGained > 0) {
    const result = addXP(updatedUser, xpGained);
    updatedUser = result.user;
    return {
      user: updatedUser,
      xpGained,
      levelUpEvent: result.levelUpEvent
    };
  }
  
  return {
    user: updatedUser,
    xpGained,
    levelUpEvent: null
  };
};

// Create a new custom quest
export const createCustomQuest = (
  user: User, 
  name: string, 
  description: string, 
  type: 'daily' | 'weekly' | 'achievement' | 'storyline',
  tasks: string[],
  xpReward: number,
  deadline?: Date
): User => {
  const newQuest: Quest = {
    id: `quest-${uuidv4()}`,
    name,
    description,
    type,
    requirements: tasks.map(task => ({
      id: uuidv4(),
      description: task,
      isComplete: false
    })),
    xpReward,
    isComplete: false,
    deadline
  };
  
  return {
    ...user,
    quests: [...user.quests, newQuest]
  };
};

// Create a new dungeon run
export const createDungeonRun = (
  user: User,
  name: string,
  description: string,
  duration: number,
  xpReward: number
): User => {
  const newDungeon: DungeonRun = {
    id: `dungeon-${uuidv4()}`,
    name,
    description,
    duration,
    completed: false,
    rewards: {
      xp: xpReward
    },
    createdAt: new Date()
  };
  
  return {
    ...user,
    dungeonRuns: [...user.dungeonRuns, newDungeon]
  };
};

// Create a new streak
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

// Check and update achievements
export const checkAchievements = (user: User): User => {
  const updatedAchievements = [...user.achievements];
  let changed = false;
  
  // Check level achievements
  const levelAchievement = updatedAchievements.find(a => a.id === 'achievement-first-level');
  if (levelAchievement && !levelAchievement.isUnlocked && user.level >= 2) {
    const index = updatedAchievements.findIndex(a => a.id === 'achievement-first-level');
    updatedAchievements[index] = {
      ...levelAchievement,
      isUnlocked: true,
      unlockedAt: new Date()
    };
    changed = true;
  }
  
  // Check streak achievements
  const streakAchievement = updatedAchievements.find(a => a.id === 'achievement-streak-3');
  if (streakAchievement && !streakAchievement.isUnlocked && user.streaks.some(s => s.days >= 3)) {
    const index = updatedAchievements.findIndex(a => a.id === 'achievement-streak-3');
    updatedAchievements[index] = {
      ...streakAchievement,
      isUnlocked: true,
      unlockedAt: new Date()
    };
    changed = true;
  }
  
  if (changed) {
    return {
      ...user,
      achievements: updatedAchievements
    };
  }
  
  return user;
};

// Equip or unequip an item
export const toggleEquipItem = (user: User, itemId: string): User => {
  const itemIndex = user.inventory.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    const updatedInventory = [...user.inventory];
    updatedInventory[itemIndex] = {
      ...updatedInventory[itemIndex],
      isEquipped: !updatedInventory[itemIndex].isEquipped
    };
    
    return {
      ...user,
      inventory: updatedInventory
    };
  }
  
  return user;
};

// Activate or deactivate a skill
export const toggleSkill = (user: User, skillId: string): User => {
  const skillIndex = user.skills.findIndex(skill => skill.id === skillId);
  
  if (skillIndex >= 0) {
    const updatedSkills = [...user.skills];
    updatedSkills[skillIndex] = {
      ...updatedSkills[skillIndex],
      isActive: !updatedSkills[skillIndex].isActive
    };
    
    return {
      ...user,
      skills: updatedSkills
    };
  }
  
  return user;
};

// Get color for rarity
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common':
      return 'text-green-500';
    case 'uncommon':
      return 'text-blue-400';
    case 'rare':
      return 'text-purple-500';
    case 'epic':
      return 'text-pink-500';
    case 'legendary':
      return 'text-yellow-400';
    default:
      return 'text-gray-400';
  }
};

// Get color for skill type
export const getSkillTypeColor = (type: string): string => {
  switch (type) {
    case 'combat':
      return 'text-red-500';
    case 'intellect':
      return 'text-blue-400';
    case 'utility':
      return 'text-green-500';
    case 'special':
      return 'text-purple-500';
    default:
      return 'text-gray-400';
  }
};

// Get XP progress percentage
export const getXPProgressPercentage = (current: number, required: number): number => {
  return Math.min(Math.floor((current / required) * 100), 100);
};

// Get stat icon
export const getStatIcon = (statType: StatType): string => {
  switch (statType) {
    case 'strength':
      return 'dumbbell';
    case 'intelligence':
      return 'brain';
    case 'endurance':
      return 'heart';
    case 'willpower':
      return 'shield';
    case 'charisma':
      return 'users';
    case 'dexterity':
      return 'target';
    default:
      return 'circle';
  }
};
