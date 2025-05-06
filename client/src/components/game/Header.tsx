import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Settings, MoonStar } from 'lucide-react';
import { useGameData } from '@/lib/game/useGameData';
import { useSettings } from '@/lib/game/useSettings';
import { getXPProgressPercentage } from '@/lib/game/gameHelpers';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user, activeTab, setActiveTab } = useGameData();
  const { settings, toggleDarkMode } = useSettings();
  const { level, currentXP, requiredXP } = user;
  const [xpProgress, setXpProgress] = useState(0);

  useEffect(() => {
    const progress = getXPProgressPercentage(currentXP, requiredXP);
    
    // Animate XP progress
    const timer = setTimeout(() => {
      setXpProgress(progress);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentXP, requiredXP]);

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-4 py-2 bg-black/80 backdrop-blur-sm border-b border-purple-900/50 flex items-center justify-between shadow-lg">
      <div className="flex items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mr-3 p-1.5 bg-gradient-to-br from-purple-900/40 to-purple-600/30 rounded-full"
        >
          <Shield className="h-7 w-7 text-purple-400 glow-text" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold gradient-text">
            Solo Leveling
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-purple-300/90">Hunter {user.username}</span>
            <span className="text-xs font-semibold bg-purple-900/30 px-2 py-0.5 rounded-md text-purple-200 border border-purple-500/20">
              LVL {level}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-purple-400/90">XP</span>
          <span className="text-xs font-medium text-purple-400/90">
            {currentXP}/{requiredXP}
          </span>
        </div>
        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-purple-900/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-700 to-purple-400"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleDarkMode}
          className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-950/50 transition-all duration-200"
        >
          <MoonStar size={18} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setActiveTab('settings')}
          className={`h-8 w-8 transition-all duration-200 ${
            activeTab === 'settings' 
              ? 'text-purple-300 bg-purple-900/50 border border-purple-700/30' 
              : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/50'
          }`}
        >
          <Settings size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Header;
