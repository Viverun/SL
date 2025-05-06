import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { Quest, QuestTask } from '@/lib/game/gameTypes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Trophy, 
  BookOpen, 
  RotateCcw 
} from 'lucide-react';
import { format } from 'date-fns';

const QuestLog = () => {
  const { user, completeTaskAction, createQuest } = useGameData();
  const { quests } = user;
  const [activeTab, setActiveTab] = useState<string>('active');
  
  // Create quest dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newQuestName, setNewQuestName] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [newQuestType, setNewQuestType] = useState<'daily' | 'weekly' | 'achievement' | 'storyline'>('daily');
  const [newQuestTasks, setNewQuestTasks] = useState<string[]>(['']);
  const [newQuestXp, setNewQuestXp] = useState(50);
  
  // Filter quests based on active tab
  const filteredQuests = activeTab === 'active'
    ? quests.filter(quest => !quest.isComplete)
    : quests.filter(quest => quest.isComplete);
  
  // Handle task completion
  const handleTaskCompletion = (questId: string, taskId: string) => {
    completeTaskAction({
      taskType: 'quest',
      id: questId,
      taskId,
      completionTime: new Date()
    });
  };
  
  // Update task input in create dialog
  const updateTaskInput = (index: number, value: string) => {
    const updatedTasks = [...newQuestTasks];
    updatedTasks[index] = value;
    setNewQuestTasks(updatedTasks);
  };
  
  // Add new task input in create dialog
  const addTaskInput = () => {
    setNewQuestTasks([...newQuestTasks, '']);
  };
  
  // Remove task input in create dialog
  const removeTaskInput = (index: number) => {
    const updatedTasks = [...newQuestTasks];
    updatedTasks.splice(index, 1);
    setNewQuestTasks(updatedTasks);
  };
  
  // Handle quest creation
  const handleCreateQuest = () => {
    if (newQuestName.trim() === '') return;
    
    const filteredTasks = newQuestTasks.filter(task => task.trim() !== '');
    if (filteredTasks.length === 0) return;
    
    createQuest(
      newQuestName,
      newQuestDescription,
      newQuestType,
      filteredTasks,
      newQuestXp,
      newQuestType === 'daily' 
        ? new Date(new Date().setHours(23, 59, 59, 999)) 
        : newQuestType === 'weekly'
          ? new Date(new Date().setDate(new Date().getDate() + 7))
          : undefined
    );
    
    // Reset form
    setNewQuestName('');
    setNewQuestDescription('');
    setNewQuestType('daily');
    setNewQuestTasks(['']);
    setNewQuestXp(50);
    setIsCreateDialogOpen(false);
  };
  
  // Get quest icon based on type
  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-4 w-4" />;
      case 'weekly':
        return <RotateCcw className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      case 'storyline':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };
  
  // Get quest type color
  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'text-blue-400';
      case 'weekly':
        return 'text-green-400';
      case 'achievement':
        return 'text-yellow-400';
      case 'storyline':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-blue-400">Quest Log</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Plus className="h-4 w-4 mr-1" />
              New Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-gray-900 border-blue-900/50">
            <DialogHeader>
              <DialogTitle className="text-blue-400">Create Custom Quest</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">Quest Name</label>
                <Input 
                  value={newQuestName} 
                  onChange={e => setNewQuestName(e.target.value)} 
                  placeholder="Enter quest name"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">Description</label>
                <Input 
                  value={newQuestDescription} 
                  onChange={e => setNewQuestDescription(e.target.value)} 
                  placeholder="Quest description"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">Quest Type</label>
                <TabsList className="w-full bg-gray-800 border border-gray-700">
                  <TabsTrigger 
                    value="daily" 
                    onClick={() => setNewQuestType('daily')}
                    className={`flex-1 ${newQuestType === 'daily' ? 'bg-blue-900/50' : ''}`}
                  >
                    Daily
                  </TabsTrigger>
                  <TabsTrigger 
                    value="weekly" 
                    onClick={() => setNewQuestType('weekly')}
                    className={`flex-1 ${newQuestType === 'weekly' ? 'bg-blue-900/50' : ''}`}
                  >
                    Weekly
                  </TabsTrigger>
                  <TabsTrigger 
                    value="achievement" 
                    onClick={() => setNewQuestType('achievement')}
                    className={`flex-1 ${newQuestType === 'achievement' ? 'bg-blue-900/50' : ''}`}
                  >
                    Achievement
                  </TabsTrigger>
                  <TabsTrigger 
                    value="storyline" 
                    onClick={() => setNewQuestType('storyline')}
                    className={`flex-1 ${newQuestType === 'storyline' ? 'bg-blue-900/50' : ''}`}
                  >
                    Storyline
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">Tasks</label>
                <div className="space-y-2">
                  {newQuestTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={task} 
                        onChange={e => updateTaskInput(index, e.target.value)} 
                        placeholder={`Task ${index + 1}`}
                        className="flex-1 bg-gray-800 border-gray-700"
                      />
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="destructive" 
                        onClick={() => removeTaskInput(index)}
                        disabled={newQuestTasks.length <= 1}
                        className="h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={addTaskInput}
                    className="w-full mt-1 border-dashed border-gray-600 text-gray-400"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-300">XP Reward</label>
                <Input 
                  type="number" 
                  min="10" 
                  max="1000" 
                  value={newQuestXp} 
                  onChange={e => setNewQuestXp(parseInt(e.target.value) || 0)} 
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="flex justify-end mt-4">
                <Button 
                  onClick={handleCreateQuest}
                  disabled={newQuestName.trim() === '' || newQuestTasks.filter(t => t.trim() !== '').length === 0}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  Create Quest
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-800/60 border border-blue-900/20">
          <TabsTrigger value="active" className="flex-1 data-[state=active]:bg-blue-900/50">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 data-[state=active]:bg-blue-900/50">
            Completed
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-3">
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredQuests.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-md bg-gray-800/50 border border-gray-700/50"
                >
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`mr-2 ${getQuestTypeColor(quest.type)}`}>
                          {getQuestIcon(quest.type)}
                        </span>
                        <h3 className="text-sm font-medium text-blue-300">
                          {quest.name}
                        </h3>
                      </div>
                      <div className="flex items-center">
                        {quest.deadline && (
                          <div className="flex items-center mr-3 text-xs text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{format(new Date(quest.deadline), 'MMM d')}</span>
                          </div>
                        )}
                        <div className="px-2 py-0.5 rounded-full bg-blue-900/30 text-xs text-blue-300">
                          {quest.xpReward} XP
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {quest.description}
                    </p>
                  </div>
                  
                  <div className="space-y-1.5">
                    {quest.requirements.map((task) => (
                      <div key={task.id} className="flex items-center">
                        <Checkbox
                          id={task.id}
                          checked={task.isComplete}
                          onCheckedChange={() => !task.isComplete && handleTaskCompletion(quest.id, task.id)}
                          className="mr-2 h-4 w-4 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          disabled={task.isComplete || activeTab === 'completed'}
                        />
                        <label
                          htmlFor={task.id}
                          className={`text-xs ${
                            task.isComplete
                              ? 'text-gray-500 line-through'
                              : 'text-gray-300'
                          }`}
                        >
                          {task.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
              
              {filteredQuests.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-400 bg-gray-800/30 rounded-md">
                  {activeTab === 'active' 
                    ? 'No active quests. Create a new quest to get started!' 
                    : 'No completed quests yet'}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestLog;
