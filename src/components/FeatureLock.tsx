import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Lock, X, CheckCircle2, Tv } from 'lucide-react';
import { adService } from '../services/adService';
import { AdPlayer } from './AdPlayer';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface FeatureLockProps {
  userId: string;
  videosWatched: number;
  requiredVideos: number;
  featureName: string;
  onUnlock: () => void;
  children: React.ReactNode;
}

export function FeatureLock({ userId, videosWatched, requiredVideos, featureName, onUnlock, children }: FeatureLockProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [showAdPlayer, setShowAdPlayer] = useState(false);

  const [unlocked, setUnlocked] = useState(false);

  const handleWatchAd = () => {
    setShowAdPlayer(true);
  };

  const onAdFinished = async (success: boolean) => {
    setShowAdPlayer(false);
    if (success) {
      setIsWatching(true);
      const res = await adService.showRewardedAd(userId);
      setIsWatching(false);
      if (!res) alert("Erreur lors de l'enregistrement de la récompense.");
    } else {
      alert("Vidéo non terminée. Réessayez pour débloquer.");
    }
  };

  const handleSpend = async () => {
    if (videosWatched >= requiredVideos) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          videosWatchedTotal: increment(-requiredVideos)
        });
        setUnlocked(true);
        onUnlock();
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowOverlay(true);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative inline-block w-full">
      <div onClick={() => setShowOverlay(true)} className="cursor-pointer">
        <div className="pointer-events-none opacity-50 grayscale">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold border border-white/20">
              <Lock size={12} />
              <span>{requiredVideos} Vidéos</span>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showAdPlayer && (
          <AdPlayer isOpen={showAdPlayer} onClose={onAdFinished} />
        )}
        {showOverlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                   <Tv size={40} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-gray-900 leading-tight">Débloquer {featureName}</h3>
                   <p className="text-gray-500 text-sm font-medium">
                     Regardez {requiredVideos} vidéos publicitaires complètes pour débloquer cette fonction ou utilisez vos vidéos déjà visionnées.
                   </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-3xl space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-gray-400">Votre quota actuel :</span>
                      <span className="font-black text-blue-600 text-lg">{videosWatched} / {requiredVideos}</span>
                   </div>
                   <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${Math.min((videosWatched / requiredVideos) * 100, 100)}%` }}
                      />
                   </div>
                </div>

                <div className="flex flex-col gap-3">
                   <button 
                     onClick={handleWatchAd}
                     disabled={isWatching}
                     className="bg-[#1a1a1a] text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {isWatching ? (
                       <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                     ) : (
                       <Play size={20} fill="currentColor" />
                     )}
                     {isWatching ? "Lecture en cours..." : "Regarder une vidéo (+1)"}
                   </button>

                   <button 
                     onClick={handleSpend}
                     disabled={videosWatched < requiredVideos}
                     className="bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:bg-gray-400 disabled:scale-100"
                   >
                     <CheckCircle2 size={20} />
                     Utiliser mes crédits & Débloquer
                   </button>

                   <button 
                     onClick={() => setShowOverlay(false)}
                     className="text-gray-400 font-bold text-sm py-2 hover:text-gray-600 transition-colors"
                   >
                     Plus tard
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
