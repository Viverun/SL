# Architecture Overview

## Overview

This repository contains a full-stack web application that appears to be a gamified self-improvement system inspired by "Solo Leveling". The application follows a client-server architecture with a React-based frontend and an Express.js backend. The application uses a PostgreSQL database with Drizzle ORM for data persistence.

The game mechanics involve users completing tasks, quests, and dungeon runs to gain experience points (XP), level up their character, and improve their stats. It appears to be a personal productivity application with RPG (Role-Playing Game) elements.

## System Architecture

The system follows a modern web application architecture with the following components:

1. **Frontend**: React-based single-page application (SPA) with TypeScript
2. **Backend**: Express.js server with TypeScript
3. **Database**: PostgreSQL with Drizzle ORM for database operations
4. **Authentication**: Session-based authentication using argon2 for password hashing
5. **State Management**: React Query for server state and custom Zustand stores for client state
6. **UI**: Custom UI components based on Radix UI primitives with Tailwind CSS for styling
7. **3D Rendering**: Three.js (via React Three Fiber) for 3D game elements

### Directory Structure

```
/
├── client/                  # Frontend code
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and hooks
│   │   ├── pages/           # Page components
│   │   └── hooks/           # Custom React hooks
├── server/                  # Backend code
│   ├── controllers/         # Request handlers
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   └── storage.ts           # Data access layer
├── shared/                  # Shared code between client and server
│   ├── game.ts              # Game data types
│   └── schema.ts            # Database schema
```

## Key Components

### Frontend

1. **React Components**
   - UI Components: Based on Radix UI primitives with Tailwind CSS styling
   - Game Components: 3D game elements using React Three Fiber (a React renderer for Three.js)

2. **State Management**
   - Server State: React Query for data fetching, caching, and synchronization
   - Client State: Zustand stores for local state management
   - Game State: Custom game state management for user progression, quests, etc.

3. **Authentication**
   - Login and registration pages with form validation
   - Session-based authentication

4. **Game Mechanics**
   - User stats, skills, and inventory systems
   - Quest and task completion tracking
   - Experience and leveling system
   - Dungeon run mechanics

### Backend

1. **Express.js Server**
   - API routes for game data, authentication, and user management
   - Request logging and error handling middleware

2. **Data Access Layer**
   - Storage interface for database operations
   - Memory storage implementation for development/testing
   - Drizzle ORM for database schema and queries

3. **Authentication Controllers**
   - User registration with password hashing (argon2)
   - Login/logout handling
   - Session management

4. **Game Controllers**
   - Game state management
   - Quest and task completion handling
   - XP and level-up mechanics

### Database Schema

The database schema includes the following tables:

1. **users**: Stores user authentication data
   - id (primary key)
   - username
   - password (hashed)

2. **game_states**: Stores user game data
   - id (primary key)
   - userId (foreign key to users)
   - gameData (JSON)
   - updatedAt

3. **stat_history**: Tracks user stats over time for analytics
   - id (primary key)
   - userId (foreign key to users)
   - date
   - level, xp, and various stats (strength, intelligence, etc.)

4. **user_achievements**: Records achievements unlocked by users
   - id (primary key)
   - userId (foreign key to users)
   - achievementId
   - unlockedAt

## Data Flow

1. **Authentication Flow**
   - User registers or logs in through the frontend
   - Backend validates credentials, creates or verifies user
   - Session is established for authenticated requests
   - Frontend stores authentication state using React Query

2. **Game Data Flow**
   - Frontend fetches game data from backend API
   - User interactions (completing tasks, quests) are sent to backend
   - Backend processes game actions, updates game state
   - Updated game state is returned to frontend
   - Frontend updates local state and UI

3. **XP and Leveling Flow**
   - User completes tasks/quests, earning XP
   - Backend calculates if level-up is triggered
   - If level-up occurs, stats are increased and rewards potentially unlocked
   - Updated user state is saved to database and returned to frontend
   - Frontend displays level-up notification and updated stats

## External Dependencies

### Frontend Dependencies

1. **UI Framework**
   - React
   - Radix UI (for accessible UI primitives)
   - Tailwind CSS (utility-first CSS framework)
   - Framer Motion (for animations)

2. **State Management**
   - @tanstack/react-query (for server state)
   - Zustand (for client state)

3. **3D Rendering**
   - @react-three/fiber (React renderer for Three.js)
   - @react-three/drei (useful helpers for react-three-fiber)
   - @react-three/postprocessing (post-processing effects)

4. **Utilities**
   - uuid (for generating unique IDs)
   - clsx (for conditional class name joining)
   - sonner (toast notifications)

### Backend Dependencies

1. **Server Framework**
   - Express.js

2. **Database**
   - @neondatabase/serverless (serverless Postgres)
   - Drizzle ORM (database toolkit)

3. **Authentication**
   - argon2 (password hashing)
   - express-session (session management)
   - connect-pg-simple (PostgreSQL session store)

4. **Utilities**
   - zod (schema validation)

## Deployment Strategy

The application is configured for deployment on [Replit](https://replit.com), a cloud development environment. Key deployment configurations include:

1. **Server Configuration**
   - Express.js server serves both the API and static frontend assets
   - Vite is used for development and building the frontend

2. **Database Configuration**
   - Uses Neon Database (serverless PostgreSQL)
   - DATABASE_URL environment variable for database connection

3. **Build Process**
   - `npm run build`: Builds frontend with Vite and backend with esbuild
   - `npm run dev`: Starts development server with hot reloading
   - `npm start`: Starts production server

4. **Replit-specific Configuration**
   - `.replit` file configures the Replit environment
   - Node.js 20 runtime
   - Port 5000 is exposed as port 80 externally

5. **CI/CD**
   - Basic workflow configuration in `.replit` for running the application

## Security Considerations

1. **Authentication Security**
   - Argon2 for password hashing (modern, secure algorithm)
   - Sessions for maintaining authentication state

2. **Data Validation**
   - Zod schemas for validating user input and database operations

3. **API Security**
   - Authentication middleware to protect API routes
   - Input validation to prevent malicious data

## Future Considerations

1. **Scalability**
   - The current architecture can be extended to support more complex game mechanics
   - Database schema allows for tracking user progress and analytics

2. **Performance**
   - 3D rendering performance optimizations might be needed as the game complexity grows
   - Database queries could be optimized for larger user bases

3. **Features**
   - Additional game mechanics like multiplayer or social features could be added
   - Enhanced analytics and progress tracking