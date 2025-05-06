import React from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { GameTab } from '@/lib/game/gameTypes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getXPProgressPercentage } from '@/lib/game/gameHelpers';
import { 
  LayoutDashboard,
  ScrollText,
  Backpack,
  Cpu,
  Swords,
  Activity,
  Calendar,
  BarChart3,
  Settings,
  User,
  Shield
} from 'lucide-react';

const Sidebar = () => {
  const { user, activeTab, setActiveTab } = useGameData();
  const { level, currentXP, requiredXP } = user;
  
  // Nav items config
  const navItems: {id: GameTab; label: string; icon: React.ReactNode}[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: 'quests', label: 'Quests', icon: <ScrollText className="h-5 w-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Backpack className="h-5 w-5" /> },
    { id: 'skills', label: 'Skills', icon: <Cpu className="h-5 w-5" /> },
    { id: 'dungeons', label: 'Dungeons', icon: <Swords className="h-5 w-5" /> },
    { id: 'stats', label: 'Stats', icon: <Activity className="h-5 w-5" /> },
    { id: 'streaks', label: 'Streaks', icon: <Calendar className="h-5 w-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> }
  ];
  
  // XP progress percentage
  const xpProgress = getXPProgressPercentage(currentXP, requiredXP);
  
  return (
    <div className="h-full flex flex-col bg-black/80 backdrop-blur-sm border-r border-purple-900/30 w-64 shadow-xl">
      {/* User info */}
      <div className="p-4 border-b border-purple-900/30 bg-gradient-to-r from-purple-950 to-black">
        <div className="flex items-center mb-3">
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-600/30 p-2 rounded-full mr-3 glow-border">
            <Shield className="h-6 w-6 text-purple-400 glow-text" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-purple-300">{user.username}</h2>
            <p className="text-xs text-purple-400/70">Level {level} Hunter</p>
          </div>
        </div>
        
        <div className="space-y-1.5 mt-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-400/90">Level Progress</span>
            <span className="text-purple-300/90 font-medium">{currentXP}/{requiredXP}</span>
          </div>
          <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-purple-900/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-700 to-purple-400"
            />
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-purple-700">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-1.5 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 border",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-purple-900/50 to-black text-purple-200 border-purple-700/30 glow-border"
                    : "text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/20 border-transparent"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <span className={cn(
                  "mr-3 transition-all duration-200",
                  activeTab === item.id
                    ? "text-purple-300"
                    : "text-purple-500"
                )}>
                  {item.icon}
                </span>
                {item.label}
              </Button>
            </motion.div>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-purple-900/30 bg-gradient-to-r from-black to-purple-950 flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full flex items-center justify-center text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/20 transition-all duration-200"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
