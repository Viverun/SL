import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from '@/components/game/GameLayout';
import { useUser } from '@/lib/stores/useUser';

const Home = () => {
  const navigate = useNavigate();
  
  // Get user state from our user store
  const { isAuthenticated, isLoading, gameData, fetchGameData } = useUser();
  
  // Fetch game data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGameData();
    }
  }, [isAuthenticated, fetchGameData]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  // Show loading state while checking auth
  if (isLoading || !gameData) {
    return (
      <div className="flex items-center justify-center h-screen animated-gradient overflow-hidden">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="flex flex-col items-center relative z-10">
            <div className="h-16 w-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-5 glow-border"></div>
            <div className="text-center space-y-2">
              <p className="text-xl text-purple-200 font-medium">Loading your hunter data...</p>
              <p className="text-sm text-purple-300/70">Preparing your Solo Leveling journey</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render game if authenticated and game data is loaded
  return <GameLayout />;
};

export default Home;
