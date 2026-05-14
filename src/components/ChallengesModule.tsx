import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Star, Target, CheckCircle2, 
  TrendingUp, Users, Play, DollarSign,
  ChevronRight, Award, Zap
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, 
  doc, updateDoc, setDoc, increment, 
  serverTimestamp, addDoc, getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, Challenge, UserChallengeProgress } from '../types';
import { cn } from '../lib/utils';

export function ChallengesModule({ user, userProfile }: { user: any, userProfile: UserProfile | null }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Record<string, UserChallengeProgress>>({});
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    if (!user) return;

    // Écouter les défis actifs
    const qChallenges = query(collection(db, 'challenges'), where('isActive', '==', true));
    const unsubChallenges = onSnapshot(qChallenges, (snap) => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge)));
    });

    // Écouter la progression de l'utilisateur
    const qProgress = query(collection(db, 'userChallenges'), where('userId', '==', user.uid));
    const unsubProgress = onSnapshot(qProgress, (snap) => {
      const progMap: Record<string, UserChallengeProgress> = {};
      snap.docs.forEach(d => {
        const data = d.data() as UserChallengeProgress;
        progMap[data.challengeId] = data;
      });
      setProgress(progMap);
    });

    return () => {
      unsubChallenges();
      unsubProgress();
    };
  }, [user]);

  const claimReward = async (challenge: Challenge) => {
    if (!userProfile) return;
    try {
      const batch = doc(db, 'users', user.uid);
      const updates: any = {};
      
      if (challenge.rewardPoints) {
        updates.quotoPoints = increment(challenge.rewardPoints);
      }
      if (challenge.rewardMoney) {
        updates.balance = increment(challenge.rewardMoney);
      }

      await updateDoc(batch, updates);
      
      const progressRef = doc(db, 'userChallenges', `${user.uid}_${challenge.id}`);
      await updateDoc(progressRef, {
        isCompleted: true,
        claimed: true,
        updatedAt: serverTimestamp()
      });

      alert(`Félicitations ! Vous avez gagné ${challenge.rewardMoney ? `$${challenge.rewardMoney}` : `${challenge.rewardPoints} points`}`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredChallenges = challenges.filter(c => {
    const isComp = progress[c.id]?.isCompleted;
    return activeTab === 'active' ? !isComp : isComp;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-32">
       <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 font-sans">Défis & Missions</h2>
              <p className="text-gray-500 font-medium italic">Transformez vos actions en récompenses réelles.</p>
            </div>
            <div className="bg-orange-50 text-[#ff6b35] p-3 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-2">
               <Zap size={20} className="fill-current" />
               <span className="font-black">{userProfile?.quotoPoints || 0} PTS</span>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
             <button 
               onClick={() => setActiveTab('active')}
               className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", activeTab === 'active' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500")}
             >
               Missions en cours
             </button>
             <button 
               onClick={() => setActiveTab('completed')}
               className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", activeTab === 'completed' ? "bg-white text-green-600 shadow-sm" : "text-gray-500")}
             >
               Terminées
             </button>
          </div>
       </header>

       <div className="grid grid-cols-1 gap-4">
         {filteredChallenges.length === 0 ? (
           <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-gray-100">
              <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold">Aucun défi dans cette catégorie</p>
           </div>
         ) : (
           filteredChallenges.map(challenge => (
             <ChallengeCard 
               key={challenge.id} 
               challenge={challenge} 
               prog={progress[challenge.id]} 
               onClaim={() => claimReward(challenge)}
             />
           ))
         )}
       </div>

       {userProfile?.creatorStatus !== 'verified' && (
         <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={160} /></div>
            <div className="relative z-10 space-y-2">
               <h3 className="text-2xl font-black">Devenez Créateur Officiel</h3>
               <p className="text-blue-100 text-sm max-w-sm">Signez votre contrat de créateur : Regardez 100 vidéos pour obtenir le Badge Bleu et activer la monétisation par les vues.</p>
            </div>
            
            <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20">
               <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-sm uppercase tracking-widest">Progression Contrat</span>
                  <span className="font-black">{userProfile?.videosWatchedTotal || 0} / 100</span>
               </div>
               <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((userProfile?.videosWatchedTotal || 0), 100)}%` }}
                    className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                  />
               </div>
            </div>

            <button 
              disabled={(userProfile?.videosWatchedTotal || 0) < 100}
              className="bg-white text-blue-700 w-full py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {(userProfile?.videosWatchedTotal || 0) < 100 ? "Contrat Verrouillé" : "Signer & Obtenir Badge Bleu"}
            </button>
         </div>
       )}
    </motion.div>
  );
}

function ChallengeCard({ challenge, prog, onClaim }: { challenge: Challenge, prog?: UserChallengeProgress, onClaim: () => void }) {
  const current = prog?.currentCount || 0;
  const target = challenge.targetCount;
  const percent = Math.min((current / target) * 100, 100);
  const isCompletedUnclaimed = prog?.currentCount && prog.currentCount >= target && !prog.isCompleted;

  return (
    <div className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
       <div className="flex items-start justify-between">
          <div className="flex gap-4">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                {challenge.type === 'follow' && <Users size={24} />}
                {challenge.type === 'post_reels' && <Play size={24} />}
                {challenge.type === 'weekly_views' && <TrendingUp size={24} />}
                {challenge.type === 'engagement' && <Star size={24} />}
             </div>
             <div>
                <h4 className="font-bold text-gray-900">{challenge.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">{challenge.description}</p>
             </div>
          </div>
          <div className="bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-yellow-100">
             {challenge.rewardMoney ? `Recompense: $${challenge.rewardMoney}` : `Gain: ${challenge.rewardPoints} PTS`}
          </div>
       </div>

       <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-gray-400">
             <span>Progression</span>
             <span>{current} / {target}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${percent}%` }}
               className={cn("h-full transition-all", percent === 100 ? "bg-green-500" : "bg-blue-500")}
             />
          </div>
       </div>

       {isCompletedUnclaimed && (
         <button 
           onClick={onClaim}
           className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
         >
           <CheckCircle2 size={18} />
           Récupérer ma récompense
         </button>
       )}
    </div>
  );
}
