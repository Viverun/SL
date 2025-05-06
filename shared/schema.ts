import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Game state table to store player's game data
export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameData: jsonb("game_data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User stats history for analytics
export const statHistory = pgTable("stat_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow().notNull(),
  level: integer("level").notNull(),
  xp: integer("xp").notNull(),
  strength: integer("strength").notNull(),
  intelligence: integer("intelligence").notNull(),
  endurance: integer("endurance").notNull(),
  willpower: integer("willpower").notNull(),
  charisma: integer("charisma").notNull(),
  dexterity: integer("dexterity").notNull(),
});

// Achievements unlocked by users
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Game data schema
export const gameDataSchema = z.object({
  id: z.number(),
  username: z.string(),
  level: z.number(),
  currentXP: z.number(),
  requiredXP: z.number(),
  stats: z.object({
    strength: z.number(),
    intelligence: z.number(),
    endurance: z.number(),
    willpower: z.number(),
    charisma: z.number(),
    dexterity: z.number(),
  }),
  achievements: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    isUnlocked: z.boolean(),
    unlockedAt: z.date().optional(),
  })),
  skills: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    level: z.number(),
    type: z.enum(['combat', 'intellect', 'utility', 'special']),
    effect: z.string(),
    icon: z.string(),
    unlocked: z.boolean(),
    parentSkillId: z.string().optional(),
    isActive: z.boolean(),
  })),
  inventory: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['weapon', 'armor', 'accessory', 'consumable']),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
    effect: z.string(),
    icon: z.string(),
    isEquipped: z.boolean(),
    statBoosts: z.object({
      strength: z.number().optional(),
      intelligence: z.number().optional(),
      endurance: z.number().optional(),
      willpower: z.number().optional(),
      charisma: z.number().optional(),
      dexterity: z.number().optional(),
    }).optional(),
  })),
  quests: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['daily', 'weekly', 'achievement', 'storyline']),
    requirements: z.array(z.object({
      id: z.string(),
      description: z.string(),
      isComplete: z.boolean(),
    })),
    xpReward: z.number(),
    itemReward: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.enum(['weapon', 'armor', 'accessory', 'consumable']),
      rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
      effect: z.string(),
      icon: z.string(),
      isEquipped: z.boolean(),
      statBoosts: z.object({
        strength: z.number().optional(),
        intelligence: z.number().optional(),
        endurance: z.number().optional(),
        willpower: z.number().optional(),
        charisma: z.number().optional(),
        dexterity: z.number().optional(),
      }).optional(),
    }).optional(),
    skillReward: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      level: z.number(),
      type: z.enum(['combat', 'intellect', 'utility', 'special']),
      effect: z.string(),
      icon: z.string(),
      unlocked: z.boolean(),
      parentSkillId: z.string().optional(),
      isActive: z.boolean(),
    }).optional(),
    isComplete: z.boolean(),
    deadline: z.date().optional(),
  })),
  streaks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    days: z.number(),
    lastCompleted: z.date(),
    isActive: z.boolean(),
  })),
  dungeonRuns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    duration: z.number(),
    completed: z.boolean(),
    rewards: z.object({
      xp: z.number(),
      items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        type: z.enum(['weapon', 'armor', 'accessory', 'consumable']),
        rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
        effect: z.string(),
        icon: z.string(),
        isEquipped: z.boolean(),
        statBoosts: z.object({
          strength: z.number().optional(),
          intelligence: z.number().optional(),
          endurance: z.number().optional(),
          willpower: z.number().optional(),
          charisma: z.number().optional(),
          dexterity: z.number().optional(),
        }).optional(),
      })).optional(),
    }),
    createdAt: z.date(),
    completedAt: z.date().optional(),
  })),
});

// For API responses
export const taskCompletionSchema = z.object({
  taskType: z.enum(['quest', 'streak', 'dungeon']),
  id: z.string(),
  taskId: z.string().optional(),
  completionTime: z.date(),
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
export type GameData = z.infer<typeof gameDataSchema>;
export type TaskCompletion = z.infer<typeof taskCompletionSchema>;
