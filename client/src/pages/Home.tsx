import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import GameLayout from '@/components/game/GameLayout';
import { useGameData } from '@/lib/game/useGameData';

const Home = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useGameData();
  
  // Check if user is authenticated
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !authData) {
      navigate('/login');
    }
  }, [authData, authLoading, navigate]);
  
  // Show loading state while checking auth
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-blue-400 font-medium">Loading your hunter data...</p>
        </div>
      </div>
    );
  }
  
  // Render game if authenticated
  return <GameLayout />;
};

export default Home;
