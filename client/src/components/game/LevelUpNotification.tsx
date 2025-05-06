import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Award, X, ArrowUp, Sparkles } from 'lucide-react';

const LevelUpNotification = () => {
  const { levelUpNotification, dismissLevelUpNotification } = useGameData();
  const { playSuccess } = useAudio();
  
  useEffect(() => {
    // Play success sound when level up notification appears
    if (levelUpNotification) {
      playSuccess();
    }
  }, [levelUpNotification, playSuccess]);
  
  if (!levelUpNotification) return null;
  
  const { oldLevel, newLevel, newStats, unlockedSkills = [], unlockedItems = [] } = levelUpNotification;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="bg-gray-900 border border-blue-800 rounded-lg shadow-xl shadow-blue-900/20 max-w-md w-full mx-4 relative overflow-hidden"
        >
          {/* Blue glow at the top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-400"></div>
          
          {/* Animated particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0, 
                  x: Math.random() * 400 - 200, 
                  y: Math.random() * 400 - 200 
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, Math.random() * 0.8 + 0.2, 0],
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: Math.random() * 2
                }}
                className="absolute w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"
              />
            ))}
          </motion.div>
          
          {/* Close button */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-800/80"
            onClick={dismissLevelUpNotification}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <div className="bg-blue-900/40 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-center text-blue-400 mb-1">Level Up!</h2>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-gray-400 text-lg">{oldLevel}</span>
                <ArrowUp className="h-5 w-5 text-blue-500" />
                <span className="text-blue-400 text-2xl font-bold">{newLevel}</span>
              </div>
            </motion.div>
            
            <Separator className="my-4 bg-gray-800" />
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-1.5" />
                Stat Increases
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-800/60 rounded p-2 flex items-center justify-between">
                  <span className="text-gray-400">Strength</span>
                  <span className="text-blue-400 font-medium">{newStats.strength}</span>
                </div>
                <div className="bg-gray-800/60 rounded p-2 flex items-center justify-between">
                  <span className="text-gray-400">Intelligence</span>
                  <span className="text-blue-400 font-medium">{newStats.intelligence}</span>
                </div>
                <div className="bg-gray-800/60 rounded p-2 flex items-center justify-between">
                  <span className="text-gray-400">Endurance</span>
                  <span className="text-blue-400 font-medium">{newStats.endurance}</span>
                </div>
                <div className="bg-gray-800/60 rounded p-2 flex items-center justify-between">
                  <span className="text-gray-400">Willpower</span>
                  <span className="text-blue-400 font-medium">{newStats.willpower}</span>
                </div>
                <div className="bg-gray-800/60 rounded p-2 flex items-center justify-between">
                  <span className="text-gray-400">Charisma</span>
                  <span className="text-blue-400 font-medium">{newStats.charisma}</span>
                </div>
                <div className="bg-gray-800/60 rounded p-2 flex items-center justify-between">
                  <span className="text-gray-400">Dexterity</span>
                  <span className="text-blue-400 font-medium">{newStats.dexterity}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Unlocks (if any) */}
            {(unlockedSkills.length > 0 || unlockedItems.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-sm font-medium text-blue-300 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-1.5" />
                  New Unlocks
                </h3>
                
                {unlockedSkills.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-xs text-gray-400 mb-1">Skills:</h4>
                    <div className="space-y-1">
                      {unlockedSkills.map(skill => (
                        <div key={skill.id} className="bg-gray-800/60 rounded p-2 text-sm">
                          <span className="text-blue-300">{skill.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {unlockedItems.length > 0 && (
                  <div>
                    <h4 className="text-xs text-gray-400 mb-1">Items:</h4>
                    <div className="space-y-1">
                      {unlockedItems.map(item => (
                        <div key={item.id} className="bg-gray-800/60 rounded p-2 text-sm">
                          <span className="text-blue-300">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-500 text-blue-50"
                onClick={dismissLevelUpNotification}
              >
                Continue Your Journey
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelUpNotification;
