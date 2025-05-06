import React from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import StatsPanel from './StatsPanel';
import QuestLog from './QuestLog';
import DungeonMode from './DungeonMode';
import StreakTracker from './StreakTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getXPProgressPercentage } from '@/lib/game/gameHelpers';
import { Shield, Trophy, Award, Zap, BookOpen, Cpu } from 'lucide-react';

const Dashboard = () => {
  const { user } = useGameData();
  const { level, currentXP, requiredXP, achievements, quests, skills, streaks } = user;
  
  // Calculate statistics
  const completedQuests = quests.filter(q => q.isComplete).length;
  const activeStreaks = streaks.filter(s => s.isActive).length;
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;
  const activeSkills = skills.filter(s => s.isActive).length;
  
  // XP progress percentage
  const xpProgress = getXPProgressPercentage(currentXP, requiredXP);
  
  return (
    <div className="space-y-6">
      {/* Level and XP Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-900/50 border border-blue-900/30 rounded-lg p-4"
      >
        <div className="flex items-center mb-4">
          <div className="bg-blue-900/30 p-3 rounded-full mr-4">
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-400">Level {level} Hunter</h2>
            <p className="text-sm text-gray-400">Keep growing your power</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Current XP</span>
            <span className="text-blue-400 font-medium">{currentXP} / {requiredXP}</span>
          </div>
          <Progress value={xpProgress} className="h-2 bg-gray-800/80" indicatorClassName="bg-gradient-to-r from-blue-600 to-blue-400" />
          <p className="text-xs text-gray-500 pt-1">
            {requiredXP - currentXP} XP needed for next level
          </p>
        </div>
      </motion.div>
      
      {/* Quick Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gray-900/50 border border-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
              Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{completedQuests}</div>
            <p className="text-xs text-gray-500">completed</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border border-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-green-400" />
              Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeStreaks}</div>
            <p className="text-xs text-gray-500">active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border border-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Trophy className="h-4 w-4 mr-2 text-yellow-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{unlockedAchievements}</div>
            <p className="text-xs text-gray-500">unlocked</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 border border-blue-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
              <Cpu className="h-4 w-4 mr-2 text-purple-400" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{activeSkills}</div>
            <p className="text-xs text-gray-500">active</p>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <StatsPanel />
        </motion.div>
        
        {/* Quests Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <QuestLog />
        </motion.div>
        
        {/* Dungeon Mode */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <DungeonMode />
        </motion.div>
        
        {/* Streak Tracker */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="lg:col-span-1"
        >
          <StreakTracker />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
