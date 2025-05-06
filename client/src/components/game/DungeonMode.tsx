import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { DungeonRun } from '@/lib/game/gameTypes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Play, 
  Pause,
  SkipForward,
  Swords,
  Trophy,
  CheckCircle,
  Timer,
  Clock,
  ArrowRight,
  Plus,
  RotateCcw
} from 'lucide-react';
import { useAudio } from '@/lib/stores/useAudio';

const DungeonMode = () => {
  const { user, createDungeon, completeTaskAction } = useGameData();
  const { playHit, playSuccess } = useAudio();
  const { dungeonRuns } = user;
  
  // Active dungeon state
  const [activeDungeonId, setActiveDungeonId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create dungeon dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDungeonName, setNewDungeonName] = useState('');
  const [newDungeonDescription, setNewDungeonDescription] = useState('');
  const [newDungeonDuration, setNewDungeonDuration] = useState(25);
  const [newDungeonXp, setNewDungeonXp] = useState(100);
  
  // Find active dungeon
  const activeDungeon = activeDungeonId 
    ? dungeonRuns.find(d => d.id === activeDungeonId) 
    : null;
  
  // Get recent dungeons
  const activeDungeons = dungeonRuns.filter(d => !d.completed).slice(0, 3);
  const completedDungeons = dungeonRuns.filter(d => d.completed).slice(0, 3);
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start timer
  const startTimer = () => {
    if (!activeDungeon || activeDungeon.completed) return;
    
    setIsRunning(true);
    
    // Play sound effect
    playHit();
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set up new timer
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete
          clearInterval(timerRef.current!);
          completeDungeon();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Pause timer
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };
  
  // Skip timer (complete immediately)
  const skipTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    completeDungeon();
  };
  
  // Complete dungeon
  const completeDungeon = () => {
    if (!activeDungeonId) return;
    
    // Mark as completed
    completeTaskAction({
      taskType: 'dungeon',
      id: activeDungeonId,
      completionTime: new Date()
    });
    
    // Reset state
    setIsRunning(false);
    setActiveDungeonId(null);
    
    // Play success sound
    playSuccess();
  };
  
  // Start a dungeon
  const startDungeon = (dungeon: DungeonRun) => {
    // Set active dungeon
    setActiveDungeonId(dungeon.id);
    setTimeRemaining(dungeon.duration * 60);
    setProgress(0);
    setIsRunning(false);
  };
  
  // Create a new dungeon
  const handleCreateDungeon = () => {
    if (newDungeonName.trim() === '') return;
    
    createDungeon(
      newDungeonName,
      newDungeonDescription,
      newDungeonDuration,
      newDungeonXp
    );
    
    // Reset form
    setNewDungeonName('');
    setNewDungeonDescription('');
    setNewDungeonDuration(25);
    setNewDungeonXp(100);
    setIsCreateDialogOpen(false);
  };
  
  // Update progress when time changes
  useEffect(() => {
    if (activeDungeon) {
      const totalSeconds = activeDungeon.duration * 60;
      const progressPercent = ((totalSeconds - timeRemaining) / totalSeconds) * 100;
      setProgress(progressPercent);
    }
  }, [timeRemaining, activeDungeon]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Dungeon Mode</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Plus className="h-4 w-4 mr-1" />
              New Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] bg-gray-900 border-blue-900/50">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Create Dungeon Challenge</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-blue-300">Challenge Name</Label>
                <Input 
                  value={newDungeonName} 
                  onChange={e => setNewDungeonName(e.target.value)} 
                  placeholder="Enter challenge name"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-blue-300">Description</Label>
                <Input 
                  value={newDungeonDescription} 
                  onChange={e => setNewDungeonDescription(e.target.value)} 
                  placeholder="What will you accomplish?"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-300">Duration (minutes)</Label>
                  <span className="text-sm text-blue-400">{newDungeonDuration} min</span>
                </div>
                <Slider 
                  min={5} 
                  max={60} 
                  step={5} 
                  value={[newDungeonDuration]} 
                  onValueChange={([value]) => setNewDungeonDuration(value)} 
                  className="py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-blue-300">XP Reward</Label>
                  <span className="text-sm text-blue-400">{newDungeonXp} XP</span>
                </div>
                <Slider 
                  min={50} 
                  max={300} 
                  step={10} 
                  value={[newDungeonXp]} 
                  onValueChange={([value]) => setNewDungeonXp(value)} 
                  className="py-2"
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleCreateDungeon}
                  disabled={newDungeonName.trim() === ''}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  Create Challenge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {activeDungeonId ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-gray-800/70 border-blue-900/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md font-semibold text-blue-400">
                  <span className="flex items-center">
                    <Swords className="h-5 w-5 mr-2 text-blue-500" />
                    {activeDungeon?.name}
                  </span>
                </CardTitle>
                <div className="text-sm text-gray-400">
                  {activeDungeon?.rewards.xp} XP
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-3">
              <p className="text-sm text-gray-300 mb-4">
                {activeDungeon?.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-blue-300">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Time Remaining</span>
                  </div>
                  <div className="font-mono text-blue-400">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                
                <Progress value={progress} className="h-2 bg-gray-900/70" indicatorClassName="bg-gradient-to-r from-blue-600 to-blue-400" />
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 flex items-center justify-center space-x-3"
                >
                  {isRunning ? (
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={pauseTimer}
                      className="text-yellow-400 border-yellow-500/50 hover:bg-yellow-950/30"
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      onClick={startTimer}
                      className="bg-blue-600 hover:bg-blue-500"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start
                    </Button>
                  )}
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={skipTimer}
                    className="text-green-400 border-green-500/50 hover:bg-green-950/30"
                  >
                    <SkipForward className="h-5 w-5 mr-2" />
                    Complete
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Active dungeons section */}
          <div>
            <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
              <RotateCcw className="h-4 w-4 mr-1" />
              Available Challenges
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeDungeons.map((dungeon) => (
                <motion.div
                  key={dungeon.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-gray-800/50 border-gray-700/50 hover:border-blue-900/50 cursor-pointer transition-colors"
                    onClick={() => startDungeon(dungeon)}
                  >
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm font-medium text-blue-300">
                        {dungeon.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-xs text-gray-400">{dungeon.description}</p>
                    </CardContent>
                    <CardFooter className="py-2 px-4 flex justify-between items-center">
                      <div className="flex items-center text-xs text-gray-400">
                        <Timer className="h-3.5 w-3.5 mr-1" />
                        {dungeon.duration}m
                      </div>
                      <div className="flex items-center text-xs text-blue-400">
                        <Trophy className="h-3.5 w-3.5 mr-1" />
                        {dungeon.rewards.xp} XP
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
              
              {activeDungeons.length === 0 && (
                <div className="col-span-full p-4 text-center text-sm text-gray-400 bg-gray-800/30 rounded-md">
                  No active challenges. Create a new one to get started!
                </div>
              )}
            </div>
          </div>
          
          {/* Completed dungeons section */}
          {completedDungeons.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Recently Completed
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {completedDungeons.map((dungeon) => (
                  <motion.div
                    key={dungeon.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="bg-gray-800/30 border-gray-700/30">
                      <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                          {dungeon.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-4">
                        <p className="text-xs text-gray-500">{dungeon.description}</p>
                      </CardContent>
                      <CardFooter className="py-2 px-4 flex justify-between items-center">
                        <div className="flex items-center text-xs text-gray-500">
                          <Timer className="h-3.5 w-3.5 mr-1" />
                          {dungeon.duration}m
                        </div>
                        <div className="flex items-center text-xs text-green-500">
                          <Trophy className="h-3.5 w-3.5 mr-1" />
                          {dungeon.rewards.xp} XP
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DungeonMode;
