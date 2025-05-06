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
    <div className="relative h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
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
