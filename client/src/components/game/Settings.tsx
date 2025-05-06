import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '@/lib/game/useSettings';
import { useGameData } from '@/lib/game/useGameData';
import { useAudio } from '@/lib/stores/useAudio';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Music, 
  Sparkles,
  Eye, 
  RefreshCw,
  Save,
  RotateCcw,
  AlertTriangle,
  BadgeInfo
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

const Settings = () => {
  const { 
    settings, 
    toggleDarkMode, 
    toggleSound, 
    toggleMusic, 
    toggleAnimations, 
    toggleAutoSave, 
    setTextSize, 
    toggleHighContrast, 
    toggleReduceMotion,
    resetSettings
  } = useSettings();
  
  const { resetGameState } = useGameData();
  const { backgroundMusic } = useAudio();
  
  // Apply music setting whenever it changes
  useEffect(() => {
    if (backgroundMusic) {
      if (settings.musicEnabled) {
        backgroundMusic.play().catch(err => console.log('Music play prevented:', err));
      } else {
        backgroundMusic.pause();
      }
    }
  }, [settings.musicEnabled, backgroundMusic]);
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="bg-gray-900/50 border border-blue-900/30">
          <CardHeader>
            <CardTitle className="text-blue-400">Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Customize your Solo Leveling experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="appearance">
              <TabsList className="w-full mb-4 bg-gray-800/60 border border-blue-900/20">
                <TabsTrigger value="appearance" className="flex-1 data-[state=active]:bg-blue-900/50">
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="sound" className="flex-1 data-[state=active]:bg-blue-900/50">
                  Sound
                </TabsTrigger>
                <TabsTrigger value="accessibility" className="flex-1 data-[state=active]:bg-blue-900/50">
                  Accessibility
                </TabsTrigger>
                <TabsTrigger value="data" className="flex-1 data-[state=active]:bg-blue-900/50">
                  Data
                </TabsTrigger>
              </TabsList>
              
              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.darkMode ? (
                      <Moon className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Sun className="h-5 w-5 text-yellow-400" />
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Dark Mode</Label>
                      <p className="text-xs text-gray-400">Switch between dark and light theme</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.darkMode} 
                    onCheckedChange={toggleDarkMode} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Animations</Label>
                      <p className="text-xs text-gray-400">Enable UI animations and effects</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.animationsEnabled} 
                    onCheckedChange={toggleAnimations} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Eye className="h-5 w-5 text-blue-400" />
                    <Label className="text-sm font-medium text-gray-200">Text Size</Label>
                  </div>
                  
                  <RadioGroup 
                    value={settings.textSize} 
                    onValueChange={(v) => setTextSize(v as 'small' | 'medium' | 'large')}
                    className="flex space-x-2"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="small" id="size-small" className="text-blue-500" />
                      <Label htmlFor="size-small" className="text-xs text-gray-400">Small</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="medium" id="size-medium" className="text-blue-500" />
                      <Label htmlFor="size-medium" className="text-sm text-gray-400">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="large" id="size-large" className="text-blue-500" />
                      <Label htmlFor="size-large" className="text-base text-gray-400">Large</Label>
                    </div>
                  </RadioGroup>
                </div>
              </TabsContent>
              
              {/* Sound Tab */}
              <TabsContent value="sound" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-blue-400" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Sound Effects</Label>
                      <p className="text-xs text-gray-400">Enable sound effects for actions</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.soundEnabled} 
                    onCheckedChange={toggleSound} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {settings.musicEnabled ? (
                      <Music className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Music className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Background Music</Label>
                      <p className="text-xs text-gray-400">Play ambient background music</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.musicEnabled} 
                    onCheckedChange={toggleMusic} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </TabsContent>
              
              {/* Accessibility Tab */}
              <TabsContent value="accessibility" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-200">High Contrast</Label>
                      <p className="text-xs text-gray-400">Increase contrast for readability</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.accessibility.highContrast} 
                    onCheckedChange={toggleHighContrast} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 text-blue-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Reduce Motion</Label>
                      <p className="text-xs text-gray-400">Minimize animations and motion effects</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.accessibility.reduceMotion} 
                    onCheckedChange={toggleReduceMotion} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </TabsContent>
              
              {/* Data Tab */}
              <TabsContent value="data" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Save className="h-5 w-5 text-blue-400" />
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Auto Save</Label>
                      <p className="text-xs text-gray-400">Automatically save your progress</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.autoSave} 
                    onCheckedChange={toggleAutoSave} 
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="h-5 w-5 text-yellow-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Reset Settings</Label>
                      <p className="text-xs text-gray-400">Restore default settings</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={resetSettings}
                    className="w-full border-yellow-900/50 text-yellow-500 hover:text-yellow-400 hover:bg-yellow-950/20"
                  >
                    Reset to Defaults
                  </Button>
                </div>
                
                <Separator className="my-4 bg-gray-800" />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-200">Reset Game Data</Label>
                      <p className="text-xs text-gray-400">Delete all progress and start over</p>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full bg-red-900/30 text-red-500 hover:text-red-400 hover:bg-red-900/50"
                      >
                        Reset Game Data
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-gray-900 border-red-900/50">
                      <DialogHeader>
                        <DialogTitle className="text-red-400">Confirm Reset</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          This will permanently delete all your progress, stats, quests, achievements, and items.
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="bg-black/30 p-3 rounded-md border border-red-900/30 my-2">
                        <div className="flex items-start">
                          <BadgeInfo className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                          <p className="text-sm text-gray-300">
                            Consider exporting your data before resetting if you want to keep a backup.
                          </p>
                        </div>
                      </div>
                      
                      <DialogFooter className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {}}
                          className="border-gray-700 text-gray-400 hover:text-gray-300"
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={resetGameState}
                          className="bg-red-900/50 hover:bg-red-900/80"
                        >
                          Reset Everything
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
