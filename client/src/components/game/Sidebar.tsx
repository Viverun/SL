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
    <div className="h-full flex flex-col bg-gray-900 border-r border-blue-900/30 w-64">
      {/* User info */}
      <div className="p-4 border-b border-blue-900/30">
        <div className="flex items-center mb-3">
          <div className="bg-blue-900/30 p-2 rounded-full mr-3">
            <Shield className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-blue-400">{user.username}</h2>
            <p className="text-xs text-gray-500">Level {level} Hunter</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Level Progress</span>
            <span className="text-blue-400">{currentXP}/{requiredXP}</span>
          </div>
          <Progress value={xpProgress} className="h-1.5 bg-gray-800/80" indicatorClassName="bg-gradient-to-r from-blue-600 to-blue-400" />
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-1 px-3 py-2 text-sm font-medium rounded-md",
                  activeTab === item.id
                    ? "bg-blue-900/30 text-blue-400"
                    : "text-gray-400 hover:text-blue-300 hover:bg-blue-900/20"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="mr-3 text-blue-500">{item.icon}</span>
                {item.label}
              </Button>
            </motion.div>
          ))}
        </nav>
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-blue-900/30 flex items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full flex items-center justify-center text-gray-400 hover:text-blue-300"
        >
          <User className="h-4 w-4 mr-2" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
