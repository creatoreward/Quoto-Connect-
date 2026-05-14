import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tv, Timer, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdPlayerProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  type?: 'rewarded' | 'interstitial';
}

export function AdPlayer({ isOpen, onClose, type = 'rewarded' }: AdPlayerProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(15);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const handleFinish = () => {
    if (canClose) {
      onClose(true);
    } else {
      if (confirm("Voulez-vous vraiment quitter ? Vous ne recevrez pas votre récompense.")) {
        onClose(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-white"
        >
          {/* Ad Controls */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                <Timer size={14} className="text-yellow-400" />
                <span className="text-xs font-bold font-mono">{timeLeft}s</span>
             </div>
             
             <button 
               onClick={handleFinish}
               className={cn(
                 "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                 canClose ? "bg-white text-black" : "bg-white/10 text-white/40"
               )}
             >
               <X size={24} />
             </button>
          </div>

          {/* Ad Content Placeholder */}
          <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-6">
             <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                <Tv size={64} className="text-white/20" />
             </div>
             
             <div className="text-center space-y-2 max-w-xs">
                <h2 className="text-xl font-bold">Publicité AdMob</h2>
                <p className="text-sm text-gray-500">Simulation de contenu partenaire pour Quoto Connect.</p>
             </div>

             <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center px-8 gap-4">
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '100%' }}
                     transition={{ duration: 15, ease: 'linear' }}
                     className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                   />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase font-bold tracking-widest">
                   <Info size={10} />
                   <span>Annonce de test • {type}</span>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
