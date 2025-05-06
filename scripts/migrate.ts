// Migration script to create database tables
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { sql } from 'drizzle-orm';

// Database connection URL
const databaseUrl = 'postgres://neondb_owner:npg_o1ZWNY7gtLuw@ep-little-fire-a4ym6ie7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Connect to the database
const sql = neon(databaseUrl);
const db = drizzle(sql);

async function createTables() {
  try {
    console.log('Creating database tables...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;
    console.log('✓ Created users table');
    
    // Create game_states table
    await sql`
      CREATE TABLE IF NOT EXISTS game_states (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        data JSONB NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ Created game_states table');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
createTables();