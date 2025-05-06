// Local copy of schema for Vercel serverless function
import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

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
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type GameState = typeof gameStates.$inferSelect;