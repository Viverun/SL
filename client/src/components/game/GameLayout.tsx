import React, { useEffect } from 'react';
import { useGameData } from '@/lib/game/useGameData';
import { useSettings } from '@/lib/game/useSettings';
import { initializeSettings } from '@/lib/game/useSettings';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import QuestLog from './QuestLog';
import Inventory from './Inventory';
import SkillTree from './SkillTree';
import DungeonMode from './DungeonMode';
import StatsPanel from './StatsPanel';
import StreakTracker from './StreakTracker';
import Analytics from './Analytics';
import Settings from './Settings';
import LevelUpNotification from './LevelUpNotification';

const GameLayout = () => {
  const { activeTab } = useGameData();
  
  // Initialize settings on first load
  useEffect(() => {
    initializeSettings();
  }, []);
  
  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'quests':
        return <QuestLog />;
      case 'inventory':
        return <Inventory />;
      case 'skills':
        return <SkillTree />;
      case 'dungeons':
        return <DungeonMode />;
      case 'stats':
        return <StatsPanel />;
      case 'streaks':
        return <StreakTracker />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* Background with animated gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950 to-black bg-fixed">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-10 w-40 h-40 bg-purple-700/20 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-1 pt-14 overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-purple-700">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Level Up Notification */}
      <LevelUpNotification />
    </div>
  );
};

export default GameLayout;
