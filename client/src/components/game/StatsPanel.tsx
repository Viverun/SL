import React from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { getStatIcon } from '@/lib/game/gameHelpers';
import { StatType } from '@/lib/game/gameTypes';
import { Progress } from '@/components/ui/progress';
import { 
  Dumbbell, 
  Brain, 
  Heart, 
  Shield, 
  Users, 
  Target 
} from 'lucide-react';

const StatsPanel = () => {
  const { user } = useGameData();
  const { stats } = user;

  // Get stat icon component
  const getIconComponent = (statType: StatType) => {
    switch (statType) {
      case 'strength':
        return <Dumbbell className="h-4 w-4" />;
      case 'intelligence':
        return <Brain className="h-4 w-4" />;
      case 'endurance':
        return <Heart className="h-4 w-4" />;
      case 'willpower':
        return <Shield className="h-4 w-4" />;
      case 'charisma':
        return <Users className="h-4 w-4" />;
      case 'dexterity':
        return <Target className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Get stat color
  const getStatColor = (statType: StatType) => {
    switch (statType) {
      case 'strength':
        return 'text-red-500';
      case 'intelligence':
        return 'text-blue-500';
      case 'endurance':
        return 'text-green-500';
      case 'willpower':
        return 'text-purple-500';
      case 'charisma':
        return 'text-yellow-500';
      case 'dexterity':
        return 'text-cyan-500';
      default:
        return 'text-gray-400';
    }
  };

  // Get progress bar color
  const getProgressColor = (statType: StatType) => {
    switch (statType) {
      case 'strength':
        return 'bg-red-500';
      case 'intelligence':
        return 'bg-blue-500';
      case 'endurance':
        return 'bg-green-500';
      case 'willpower':
        return 'bg-purple-500';
      case 'charisma':
        return 'bg-yellow-500';
      case 'dexterity':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Calculate max stat value for scaling
  const maxStat = Math.max(...Object.values(stats));
  const getStatProgress = (value: number) => (value / Math.max(maxStat, 10)) * 100;

  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <h2 className="text-lg font-semibold text-blue-400 mb-3">Hunter Stats</h2>
      
      <div className="space-y-3">
        {(Object.keys(stats) as StatType[]).map((statKey) => (
          <motion.div 
            key={statKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`mr-2 ${getStatColor(statKey)}`}>
                  {getIconComponent(statKey)}
                </span>
                <span className="text-sm font-medium capitalize text-blue-200/80">
                  {statKey}
                </span>
              </div>
              <span className="text-sm font-semibold text-blue-300">
                {stats[statKey]}
              </span>
            </div>
            <Progress 
              value={getStatProgress(stats[statKey])} 
              className="h-2 bg-gray-800/70" 
              indicatorClassName={getProgressColor(statKey)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;
