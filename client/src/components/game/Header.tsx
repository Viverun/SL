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
    <div className="fixed top-0 left-0 w-full z-50 px-4 py-2 bg-black/80 backdrop-blur-sm border-b border-blue-900/50 flex items-center justify-between">
      <div className="flex items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mr-3"
        >
          <Shield className="h-8 w-8 text-blue-500" />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold text-blue-400">
            Solo Leveling
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-blue-300/90">Hunter {user.username}</span>
            <span className="text-xs font-semibold bg-blue-900/30 px-2 py-0.5 rounded-md text-blue-300">
              LVL {level}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-blue-400/80">XP</span>
          <span className="text-xs font-medium text-blue-400/80">
            {currentXP}/{requiredXP}
          </span>
        </div>
        <Progress value={xpProgress} className="h-2 bg-gray-900/50" indicatorClassName="bg-gradient-to-r from-blue-600 to-blue-400" />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleDarkMode}
          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
        >
          <MoonStar size={18} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setActiveTab('settings')}
          className={`h-8 w-8 ${
            activeTab === 'settings' 
              ? 'text-blue-300 bg-blue-950/70' 
              : 'text-blue-400 hover:text-blue-300 hover:bg-blue-950/50'
          }`}
        >
          <Settings size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Header;
