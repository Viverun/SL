import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useGameData } from '@/lib/game/useGameData';
import { Item } from '@/lib/game/gameTypes';
import { getRarityColor } from '@/lib/game/gameHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sword, Shield, Ellipsis, FlaskRound, Info, CheckCircle2 } from 'lucide-react';

const Inventory = () => {
  const { user, toggleEquip } = useGameData();
  const { inventory } = user;
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? inventory 
    : inventory.filter(item => item.type === activeTab);

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    // Handle equip action if dropped in "equipped" zone
    if (result.destination.droppableId === 'equipped-zone') {
      const item = filteredItems[sourceIndex];
      toggleEquip(item.id);
    }
  };
  
  // Get icon based on item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon':
        return <Sword className="h-5 w-5" />;
      case 'armor':
        return <Shield className="h-5 w-5" />;
      case 'accessory':
        return <Ellipsis className="h-5 w-5" />;
      case 'consumable':
        return <FlaskRound className="h-5 w-5" />;
      default:
        return <Sword className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-4 rounded-lg bg-gray-900/50 border border-blue-900/30">
      <h2 className="text-lg font-semibold text-blue-400 mb-4">Inventory</h2>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-800/60 border border-blue-900/20">
          <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-blue-900/50">
            All
          </TabsTrigger>
          <TabsTrigger value="weapon" className="flex-1 data-[state=active]:bg-blue-900/50">
            Weapons
          </TabsTrigger>
          <TabsTrigger value="armor" className="flex-1 data-[state=active]:bg-blue-900/50">
            Armor
          </TabsTrigger>
          <TabsTrigger value="accessory" className="flex-1 data-[state=active]:bg-blue-900/50">
            Accessory
          </TabsTrigger>
          <TabsTrigger value="consumable" className="flex-1 data-[state=active]:bg-blue-900/50">
            Consumable
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-3">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="text-xs text-blue-400/60 mb-2">
              Drag items to equip/unequip or use the toggle button
            </div>
            
            <div className="relative grid grid-cols-1 gap-2">
              <Droppable droppableId="items-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {filteredItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 rounded-md border ${
                                item.isEquipped 
                                  ? 'bg-blue-900/30 border-blue-700/50' 
                                  : 'bg-gray-800/60 border-gray-700/50'
                              } ${snapshot.isDragging ? 'shadow-lg shadow-blue-900/30' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`p-1.5 rounded-md ${getRarityColor(item.rarity)} bg-gray-800/70 mr-3`}>
                                    {getItemIcon(item.type)}
                                  </div>
                                  <div>
                                    <div className="flex items-center">
                                      <h3 className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                                        {item.name}
                                      </h3>
                                      {item.isEquipped && (
                                        <CheckCircle2 className="h-3.5 w-3.5 ml-1.5 text-blue-400" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-400 capitalize">
                                      {item.type} · {item.rarity}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-400 hover:text-blue-300">
                                          <Info className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="max-w-xs bg-gray-900/95 border-blue-900/50">
                                        <div className="space-y-1.5">
                                          <p className="text-sm font-medium text-blue-400">{item.name}</p>
                                          <p className="text-xs text-gray-300">{item.description}</p>
                                          <p className="text-xs font-medium text-blue-300">{item.effect}</p>
                                          {item.statBoosts && Object.entries(item.statBoosts).length > 0 && (
                                            <div className="mt-2">
                                              <p className="text-xs font-medium text-blue-400 mb-1">Stat Boosts:</p>
                                              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                                {Object.entries(item.statBoosts).map(([stat, value]) => (
                                                  <p key={stat} className="text-xs text-gray-300">
                                                    <span className="capitalize">{stat}</span>: +{value}
                                                  </p>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <Button 
                                    size="sm" 
                                    variant={item.isEquipped ? "destructive" : "default"}
                                    className={
                                      item.isEquipped 
                                        ? "h-7 px-2.5 bg-blue-900/60 hover:bg-blue-800/60 text-blue-100" 
                                        : "h-7 px-2.5 bg-blue-600/70 hover:bg-blue-500/70 text-blue-100"
                                    }
                                    onClick={() => toggleEquip(item.id)}
                                  >
                                    {item.isEquipped ? "Unequip" : "Equip"}
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </AnimatePresence>
                    
                    {filteredItems.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-400 bg-gray-800/30 rounded-md border border-gray-700/30">
                        No items found in this category
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
              
              {/* Equipped zone for drag and drop */}
              <Droppable droppableId="equipped-zone">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="hidden"
                  >
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
