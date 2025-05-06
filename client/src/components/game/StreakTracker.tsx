import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { Streak } from '@/lib/game/gameTypes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus,
  Flame,
  Calendar,
  CheckCircle2,
  Circle,
  CalendarDays
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

const StreakTracker = () => {
  const { user, completeTaskAction, createStreakHabit } = useGameData();
  const { streaks } = user;
  
  // Create streak dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newStreakName, setNewStreakName] = useState('');
  const [newStreakDescription, setNewStreakDescription] = useState('');
  
  // Filter active streaks
  const activeStreaks = streaks.filter(streak => streak.isActive);
  
  // Handle streak completion
  const completeStreak = (streakId: string) => {
    completeTaskAction({
      taskType: 'streak',
      id: streakId,
      completionTime: new Date()
    });
  };
  
  // Create a new streak
  const handleCreateStreak = () => {
    if (newStreakName.trim() === '') return;
    
    createStreakHabit(
      newStreakName,
      newStreakDescription
    );
    
    // Reset form
    setNewStreakName('');
    setNewStreakDescription('');
    setIsCreateDialogOpen(false);
  };
  
  // Generate weekly calendar circles for each streak
  const generateWeekCircles = (streak: Streak) => {
    const today = new Date();
    const startDay = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDay, i);
      const dayStr = format(day, 'EEE');
      const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      
      // Check if this day is complete in the streak
      const lastCompleted = new Date(streak.lastCompleted);
      const isCompleted = format(day, 'yyyy-MM-dd') === format(lastCompleted, 'yyyy-MM-dd');
      
      // Color based on status
      let bgColor = 'bg-gray-800';
      let textColor = 'text-gray-400';
      let borderColor = 'border-gray-700';
      
      if (isCompleted) {
        bgColor = 'bg-green-900/30';
        textColor = 'text-green-400';
        borderColor = 'border-green-700/50';
      } else if (isToday) {
        bgColor = 'bg-blue-900/30';
        textColor = 'text-blue-400';
        borderColor = 'border-blue-700/50';
      }
      
      days.push(
        <div key={i} className="flex flex-col items-center">
          <div className={`text-xs ${textColor} mb-1`}>{dayStr}</div>
          <div className={`h-8 w-8 rounded-full ${bgColor} border ${borderColor} flex items-center justify-center`}>
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <Circle className="h-4 w-4 text-gray-600" />
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Streak Tracker</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Plus className="h-4 w-4 mr-1" />
              New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] bg-gray-900 border-blue-900/50">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Create New Habit</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">Habit Name</label>
                <Input 
                  value={newStreakName} 
                  onChange={e => setNewStreakName(e.target.value)} 
                  placeholder="Enter habit name"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">Description</label>
                <Input 
                  value={newStreakDescription} 
                  onChange={e => setNewStreakDescription(e.target.value)} 
                  placeholder="What is this habit for?"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleCreateStreak}
                  disabled={newStreakName.trim() === ''}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  Create Habit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-4">
        {activeStreaks.map((streak) => (
          <motion.div
            key={streak.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="py-3 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium text-blue-300 flex items-center">
                    <Flame className={`h-4 w-4 mr-2 ${streak.days > 0 ? 'text-red-500' : 'text-gray-500'}`} />
                    {streak.name}
                  </CardTitle>
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">{streak.days} days</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-xs text-gray-400 mb-3">{streak.description}</p>
                
                {/* Weekly calendar */}
                <div className="flex justify-between items-center mb-4">
                  {generateWeekCircles(streak)}
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    size="sm" 
                    onClick={() => completeStreak(streak.id)}
                    disabled={format(new Date(streak.lastCompleted), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Complete Today
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {activeStreaks.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-400 bg-gray-800/30 rounded-md">
            No active habits. Create a new habit to start building streaks!
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakTracker;
