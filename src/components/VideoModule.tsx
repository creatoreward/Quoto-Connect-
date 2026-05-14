import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Heart, MessageSquare, Share2, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { useInView } from 'react-intersection-observer';
import { adService } from '../services/adService';
import { Reel } from '../types';
import { cn } from '../lib/utils';

export function VideoModule() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollTop / scrollRef.current.clientHeight);
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReels(snap.docs.map(d => ({ id: d.id, ...d.data() } as Reel)));
    });
    return () => unsub();
  }, []);

  if (reels.length === 0) {
    return (
      <div className="h-[calc(100vh-160px)] lg:h-[calc(100vh-60px)] -mx-6 -mt-12 bg-black flex flex-col items-center justify-center text-white/40 space-y-4">
         <Play size={64} className="animate-pulse" />
         <p className="font-bold text-sm">Aucun Reel disponible</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-160px)] lg:h-[calc(100vh-60px)] -mx-6 -mt-12 bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
       {reels.map((reel, idx) => (
         <ReelItem key={reel.id} reel={reel} active={idx === activeIndex} />
       ))}
    </div>
  );
}

function ReelItem({ reel, active }: { reel: Reel, active: boolean }) {
  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false
  });

  useEffect(() => {
    if (inView) {
      const reelRef = doc(db, 'reels', reel.id);
      updateDoc(reelRef, {
        viewsCount: increment(1)
      }).catch(err => console.error("Error updating reel views:", err));

      if (reel.userId) {
        adService.trackContentAdView(reel.userId);
      }
    }
  }, [inView, reel.id, reel.userId]);

  return (
    <div ref={ref} className="h-full w-full snap-start relative bg-slate-900">
       {/* Background Video Simulator */}
       <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/10 flex flex-col items-center gap-4">
            <Play size={100} fill="currentColor" className="opacity-10" />
            <p className="text-xs font-mono uppercase tracking-[0.5em] opacity-30">Quoto Watch Feed</p>
          </div>
          {reel.videoURL && (
            <video 
              src={reel.videoURL} 
              autoPlay={active} 
              loop 
              muted 
              className="w-full h-full object-cover"
            />
          )}
       </div>

       {/* Overlay Content */}
       <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

       <div className="absolute bottom-8 left-6 text-white space-y-3 pr-16 pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
               <User size={24} className="text-white/60" />
            </div>
            <div>
              <p className="font-bold text-sm">@{reel.userName || "utilisateur_quoto"}</p>
              <button className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Suivre</button>
            </div>
          </div>
          <p className="text-sm line-clamp-2 leading-relaxed text-gray-200">{reel.description}</p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-blue-400">
             <span>#QuotoWatch</span>
             <span>#Reels</span>
          </div>
       </div>

       {/* Side Actions */}
       <div className="absolute bottom-12 right-4 flex flex-col gap-6 text-white items-center pointer-events-auto">
          <SideAction icon={<Heart size={28} className={cn(active ? "text-red-500 fill-red-500" : "")} />} label={reel.likesCount || 0} />
          <SideAction icon={<MessageSquare size={28} />} label={0} />
          <SideAction icon={<Share2 size={28} />} label="Partager" />
          <div className="flex flex-col items-center gap-1">
             <div className="w-6 h-6 rounded-full border-2 border-white overflow-hidden animate-spin-slow">
                <div className="w-full h-full bg-gradient-to-tr from-orange-400 to-yellow-600" />
             </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-1 opacity-60">
             <span className="text-[10px] font-black">{reel.viewsCount || 0}</span>
             <span className="text-[8px] uppercase tracking-tighter">vues</span>
          </div>
       </div>
    </div>
  );
}

function SideAction({ icon, label }: { icon: React.ReactNode, label: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1.5 transition-transform active:scale-90 cursor-pointer">
       <div className="drop-shadow-lg">{icon}</div>
       <span className="text-xs font-bold drop-shadow-md">{label}</span>
    </div>
  );
}
