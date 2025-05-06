import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameData } from '@/lib/game/useGameData';
import { Skill } from '@/lib/game/gameTypes';
import { getSkillTypeColor } from '@/lib/game/gameHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, ChevronDown } from 'lucide-react';

const SkillTree = () => {
  const { user, toggleSkillActive } = useGameData();
  const { skills } = user;
  const [activeTab, setActiveTab] = useState<string>('all');
  const [openSkillGroup, setOpenSkillGroup] = useState<string | null>('combat');

  // Filter skills based on active tab
  const filteredSkills = activeTab === 'all' 
    ? skills 
    : skills.filter(skill => skill.type === activeTab);

  // Group skills by type
  const groupedSkills = filteredSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const type = skill.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(skill);
    return acc;
  }, {});

  // Toggle skill group expansion
  const toggleSkillGroup = (type: string) => {
    setOpenSkillGroup(openSkillGroup === type ? null : type);
  };

  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <h2 className="text-lg font-semibold text-blue-400 mb-4">Skill Tree</h2>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-800/60 border border-blue-900/20">
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-blue-900/50">
            All
          </TabsTrigger>
          <TabsTrigger value="combat" className="flex-1 data-[state=active]:bg-blue-900/50 text-red-400">
            Combat
          </TabsTrigger>
          <TabsTrigger value="intellect" className="flex-1 data-[state=active]:bg-blue-900/50 text-blue-400">
            Intellect
          </TabsTrigger>
          <TabsTrigger value="utility" className="flex-1 data-[state=active]:bg-blue-900/50 text-green-400">
            Utility
          </TabsTrigger>
          <TabsTrigger value="special" className="flex-1 data-[state=active]:bg-blue-900/50 text-purple-400">
            Special
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-3 space-y-3">
          {Object.entries(groupedSkills).map(([type, skills]) => (
            <Collapsible
              key={type}
              open={openSkillGroup === type}
              onOpenChange={() => toggleSkillGroup(type)}
              className={`border rounded-md ${
                type === 'combat' 
                  ? 'border-red-900/30 bg-red-950/10' 
                  : type === 'intellect'
                    ? 'border-blue-900/30 bg-blue-950/10'
                    : type === 'utility'
                      ? 'border-green-900/30 bg-green-950/10'
                      : 'border-purple-900/30 bg-purple-950/10'
              }`}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full flex items-center justify-between p-3 rounded-t-md hover:bg-gray-800/30"
                >
                  <div className="flex items-center">
                    <span className={`text-sm font-medium capitalize ${getSkillTypeColor(type)}`}>
                      {type} Skills
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      ({skills.length})
                    </span>
                  </div>
                  {openSkillGroup === type ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3 space-y-2">
                {skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-md ${
                      skill.isActive 
                        ? 'bg-gray-800/60 border border-gray-700/50' 
                        : 'bg-gray-800/30 border border-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-blue-300">
                            {skill.name}
                          </h3>
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded-sm bg-gray-800 text-gray-400">
                            Lv.{skill.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {skill.description}
                        </p>
                        <p className="text-xs font-medium text-blue-400 mt-1">
                          {skill.effect}
                        </p>
                      </div>
                      
                      <div className="flex items-center">
                        <Switch
                          checked={skill.isActive}
                          onCheckedChange={() => toggleSkillActive(skill.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {skills.length === 0 && (
                  <div className="p-3 text-center text-sm text-gray-400 bg-gray-800/30 rounded-md">
                    No {type} skills unlocked yet
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
          
          {Object.keys(groupedSkills).length === 0 && (
            <div className="p-4 text-center text-sm text-gray-400 bg-gray-800/30 rounded-md border border-gray-700/30">
              No skills found in this category
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillTree;
