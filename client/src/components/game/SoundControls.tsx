import React from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

const SoundControls = () => {
  const { isMuted, toggleMute } = useAudio();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-5 right-5 z-40"
    >
      <Button 
        size="icon"
        onClick={toggleMute}
        className={`h-10 w-10 rounded-full shadow-lg transition-all duration-300
          ${isMuted 
            ? 'bg-black/60 text-purple-400/70 border border-purple-800/30 hover:bg-purple-900/20' 
            : 'bg-gradient-to-r from-purple-700 to-purple-500 text-white glow-border hover:from-purple-600 hover:to-purple-400'
          }`}
      >
        <motion.div
          key={isMuted ? 'muted' : 'unmuted'}
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 10, 0] }}
          transition={{ duration: 0.3, type: 'spring' }}
        >
          {isMuted ? (
            <VolumeX size={18} />
          ) : (
            <Volume2 size={18} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default SoundControls;