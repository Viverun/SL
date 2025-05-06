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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
          className="bg-black/90 border border-purple-700/50 rounded-lg shadow-xl shadow-purple-900/30 max-w-md w-full mx-4 relative overflow-hidden glow-border"
        >
          {/* Purple gradient at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-700 to-purple-400"></div>
          
          {/* Animated particles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {Array.from({ length: 20 }).map((_, i) => (
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
                className="absolute w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"
              />
            ))}
          </motion.div>
          
          {/* Close button */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-3 right-3 h-7 w-7 text-purple-300/70 hover:text-white hover:bg-purple-900/30 z-10"
            onClick={dismissLevelUpNotification}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-center mb-5">
              <motion.div
                initial={{ rotate: 0, scale: 0.8 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{ 
                  rotate: { duration: 3, ease: "linear", repeat: Infinity },
                  scale: { duration: 0.5, type: "spring" }
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md"></div>
                <div className="bg-gradient-to-br from-purple-900/70 to-purple-600/50 p-3.5 rounded-full relative">
                  <Shield className="h-9 w-9 text-purple-300 glow-text" />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-1 gradient-text">LEVEL UP!</h2>
              <div className="flex items-center justify-center gap-4 mb-5">
                <span className="text-purple-400/70 text-lg font-medium">{oldLevel}</span>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <ArrowUp className="h-6 w-6 text-purple-500" />
                </motion.div>
                <motion.span
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ 
                    duration: 0.7,
                    repeat: 3,
                    repeatType: "reverse"
                  }}
                  className="text-purple-300 text-3xl font-bold"
                >
                  {newLevel}
                </motion.span>
              </div>
            </motion.div>
            
            <Separator className="my-5 bg-purple-900/30" />
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-5"
            >
              <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                STAT INCREASES
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(newStats).map(([stat, value], index) => (
                  <motion.div
                    key={stat}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="bg-gradient-to-r from-black to-purple-950/30 rounded-md p-2.5 flex items-center justify-between border border-purple-900/20"
                  >
                    <span className="text-purple-300/80 capitalize">{stat}</span>
                    <span className="text-purple-200 font-medium">{value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Unlocks (if any) */}
            {(unlockedSkills.length > 0 || unlockedItems.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-4"
              >
                <h3 className="text-sm font-bold text-purple-300 mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2 text-purple-400" />
                  NEW UNLOCKS
                </h3>
                
                {unlockedSkills.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs text-purple-400/80 mb-2">Skills:</h4>
                    <div className="space-y-2">
                      {unlockedSkills.map((skill, index) => (
                        <motion.div 
                          key={skill.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + (index * 0.1) }}
                          className="bg-gradient-to-r from-purple-900/20 to-transparent rounded-md p-2.5 text-sm border border-purple-700/20"
                        >
                          <span className="text-purple-200 font-medium">{skill.name}</span>
                          <p className="text-xs text-purple-300/70 mt-1">{skill.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                
                {unlockedItems.length > 0 && (
                  <div>
                    <h4 className="text-xs text-purple-400/80 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {unlockedItems.map((item, index) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + (index * 0.1) }}
                          className="bg-gradient-to-r from-purple-900/20 to-transparent rounded-md p-2.5 text-sm border border-purple-700/20"
                        >
                          <span className="text-purple-200 font-medium">{item.name}</span>
                          <p className="text-xs text-purple-300/70 mt-1">{item.description}</p>
                        </motion.div>
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                className="w-full bg-gradient-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-medium border-0 pulse"
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
