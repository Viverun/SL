import React from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Award, 
  Calendar, 
  CheckCircle2,
  Backpack
} from 'lucide-react';

const Analytics = () => {
  const { user, analyticsData } = useGameData();
  
  // Transform XP data for charts
  const dailyXpData = analyticsData.xpGained.daily.map((xp, index) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      name: days[index],
      xp
    };
  });
  
  // Summary stats
  const summaryStats = [
    {
      title: 'Quests Completed',
      value: analyticsData.questsCompleted,
      icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
      color: 'text-green-400'
    },
    {
      title: 'Dungeons Completed',
      value: analyticsData.dungeonRunsCompleted,
      icon: <Backpack className="h-5 w-5 text-blue-400" />,
      color: 'text-blue-400'
    },
    {
      title: 'Longest Streak',
      value: analyticsData.streakLongest,
      icon: <Calendar className="h-5 w-5 text-red-400" />,
      color: 'text-red-400'
    },
    {
      title: 'Level Ups',
      value: analyticsData.levelUps,
      icon: <TrendingUp className="h-5 w-5 text-yellow-400" />,
      color: 'text-yellow-400'
    }
  ];
  
  // Create stat cards
  const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <Card className="bg-gray-800/50 border-gray-700/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <h2 className="text-lg font-semibold text-blue-400 mb-4">Analytics Dashboard</h2>
      
      <div className="space-y-6">
        {/* Summary stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {summaryStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </motion.div>
        
        {/* XP Trends */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-gray-300">XP Gained This Week</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyXpData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        borderColor: '#4B5563',
                        color: '#D1D5DB',
                        borderRadius: '4px'
                      }}
                    />
                    <Bar dataKey="xp" fill="#3B82F6" name="XP Gained" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Stats Growth */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-gray-300">Stats Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(user.stats).map(([key, value]) => ({
                      name: key.charAt(0).toUpperCase() + key.slice(1),
                      value
                    }))}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 30, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="name" type="category" stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(17, 24, 39, 0.95)',
                        borderColor: '#4B5563',
                        color: '#D1D5DB',
                        borderRadius: '4px'
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" name="Stat Value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
