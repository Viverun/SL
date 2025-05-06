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
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-blue-400 font-medium">Loading your hunter data...</p>
        </div>
      </div>
    );
  }
  
  // Render game if authenticated and game data is loaded
  return <GameLayout />;
};

export default Home;
