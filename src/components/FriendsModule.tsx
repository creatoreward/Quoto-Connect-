import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, UserMinus, Check, X, Search, 
  Users, UserCheck, Clock, UserX 
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, 
  doc, setDoc, deleteDoc, updateDoc, 
  serverTimestamp, addDoc, getDocs,
  writeBatch, limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { Globe, MapPin, Compass } from 'lucide-react';

export function FriendsModule({ user, userProfile }: { user: any, userProfile: UserProfile | null }) {
  const [activeView, setActiveView] = useState<'friends' | 'requests' | 'discover'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Suggestions intelligentes basées sur la localisation
  useEffect(() => {
    if (!user || !userProfile) return;
    const fetchSuggestions = async () => {
      try {
        const q = query(
          collection(db, 'users'), 
          limit(30)
        );
        const snap = await getDocs(q);
        const allUsers = snap.docs.map(d => d.data() as UserProfile).filter(u => u.uid !== user.uid);
        
        // Calcul du score de proximité
        const sorted = allUsers.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;
          
          if (a.cityCurrent && a.cityCurrent === userProfile.cityCurrent) scoreA += 50;
          if (b.cityCurrent && b.cityCurrent === userProfile.cityCurrent) scoreB += 50;
          
          if (a.province && a.province === userProfile.province) scoreA += 30;
          if (b.province && b.province === userProfile.province) scoreB += 30;
          
          if (a.country && a.country === userProfile.country) scoreA += 15;
          if (b.country && b.country === userProfile.country) scoreB += 15;

          if (a.region && a.region === userProfile.region) scoreA += 5;
          if (b.region && b.region === userProfile.region) scoreB += 5;
          
          return scoreB - scoreA;
        });
        
        setSuggestions(sorted);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };
    fetchSuggestions();
  }, [user, userProfile]);

  // Écouter les amitiés
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'friendships'), where('uids', 'array-contains', user.uid));
    const unsub = onSnapshot(q, async (snap) => {
      const friendIds = snap.docs.map(d => d.data().uids.find((id: string) => id !== user.uid));
      if (friendIds.length > 0) {
        const usersSnap = await getDocs(query(collection(db, 'users'), where('uid', 'in', friendIds)));
        setFriends(usersSnap.docs.map(d => d.data() as UserProfile));
      } else {
        setFriends([]);
      }
    });
    return () => unsub();
  }, [user]);

  // Écouter les demandes reçues
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'friendRequests'), where('toId', '==', user.uid), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, async (snap) => {
      const requests = [];
      for (const d of snap.docs) {
        const data = d.data();
        const fromSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', data.fromId)));
        if (!fromSnap.empty) {
          requests.push({ id: d.id, ...data, user: fromSnap.docs[0].data() as UserProfile });
        }
      }
      setPendingRequests(requests);
    });
    return () => unsub();
  }, [user]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'), 
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );
      const snap = await getDocs(q);
      setSearchResults(snap.docs.map(d => d.data() as UserProfile).filter(u => u.uid !== user.uid));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toId: string) => {
    try {
      const requestId = `${user.uid}_${toId}`;
      await setDoc(doc(db, 'friendRequests', requestId), {
        fromId: user.uid,
        toId: toId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert("Demande envoyée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi.");
    }
  };

  const acceptRequest = async (request: any) => {
    const batch = writeBatch(db);
    const friendshipId = [user.uid, request.fromId].sort().join('_');
    
    batch.set(doc(db, 'friendships', friendshipId), {
      uids: [user.uid, request.fromId],
      createdAt: serverTimestamp()
    });
    
    batch.delete(doc(db, 'friendRequests', request.id));

    // Notification
    batch.set(doc(collection(db, 'notifications'), `${request.fromId}_friend_${user.uid}`), {
      userId: request.fromId,
      type: 'friend_accept',
      message: `${userProfile?.displayName} a accepté votre demande d'ami.`,
      createdAt: serverTimestamp()
    });

    try {
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRequest = async (requestId: string) => {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-32">
       <header className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black font-display tracking-tight text-gray-900">Ami(e)s</h2>
            <p className="text-gray-500 font-medium">Gérez votre cercle social Quoto.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <ViewTab active={activeView === 'friends'} onClick={() => setActiveView('friends')} label="Amis" icon={<Users size={16} />} />
             <ViewTab active={activeView === 'requests'} onClick={() => setActiveView('requests')} label="Demandes" icon={<Clock size={16} />} count={pendingRequests.length} />
             <ViewTab active={activeView === 'discover'} onClick={() => setActiveView('discover')} label="Découvrir" icon={<Compass size={16} />} />
          </div>
       </header>

       <AnimatePresence mode="wait">
         {activeView === 'friends' && (
           <motion.div key="friends" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {friends.length === 0 ? (
                <EmptyState icon={<UserMinus size={40} />} title="Aucun ami pour le moment" description="Commencez à chercher des amis pour partager vos inspirations." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map(friend => (
                    <FriendCard key={friend.uid} profile={friend} />
                  ))}
                </div>
              )}
           </motion.div>
         )}

         {activeView === 'requests' && (
           <motion.div key="requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {pendingRequests.length === 0 ? (
                <EmptyState icon={<UserCheck size={40} />} title="Aucune demande" description="Vous n'avez pas de demandes d'amis en attente." />
              ) : (
                <div className="space-y-3">
                   {pendingRequests.map(req => (
                     <RequestRow key={req.id} request={req} onAccept={() => acceptRequest(req)} onReject={() => rejectRequest(req.id)} />
                   ))}
                </div>
              )}
           </motion.div>
         )}

         {activeView === 'discover' && (
           <motion.div key="discover" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex gap-2">
                 <input 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                   placeholder="Rechercher partout..."
                   className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 />
                 <button onClick={handleSearch} className="bg-[#1a1a1a] text-white px-6 rounded-2xl font-bold flex items-center gap-2">
                   {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Search size={18} />}
                 </button>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Résultats de recherche</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {searchResults.map(result => (
                      <SearchCard key={result.uid} profile={result} onAdd={() => sendFriendRequest(result.uid)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                   <section className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Proche de vous ({userProfile?.cityCurrent || 'Bukavu'})</h3>
                         <MapPin size={14} className="text-blue-500" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {suggestions.filter(s => s.cityCurrent === userProfile?.cityCurrent).slice(0, 4).map(sub => (
                          <SearchCard key={sub.uid} profile={sub} onAdd={() => sendFriendRequest(sub.uid)} />
                        ))}
                        {suggestions.filter(s => s.cityCurrent === userProfile?.cityCurrent).length === 0 && (
                          <p className="text-xs text-center text-gray-400 py-4 italic w-full col-span-2">Personne dans votre ville pour le moment.</p>
                        )}
                      </div>
                   </section>

                   <section className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Suggestions régionales ({userProfile?.region || 'Afrique'})</h3>
                         <Globe size={14} className="text-green-500" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {suggestions.filter(s => s.region === userProfile?.region && s.cityCurrent !== userProfile?.cityCurrent).slice(0, 6).map(sub => (
                          <SearchCard key={sub.uid} profile={sub} onAdd={() => sendFriendRequest(sub.uid)} />
                        ))}
                      </div>
                   </section>

                   <section className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Utilisateurs Globaux</h3>
                         <Compass size={14} className="text-orange-500" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {suggestions.filter(s => s.region !== userProfile?.region).slice(0, 4).map(sub => (
                          <SearchCard key={sub.uid} profile={sub} onAdd={() => sendFriendRequest(sub.uid)} />
                        ))}
                      </div>
                   </section>
                </div>
              )}
           </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
}

function ViewTab({ active, onClick, label, icon, count }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative",
        active ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-200/50"
      )}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] animate-pulse">
          {count}
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-12 rounded-[40px] text-center space-y-4 border border-gray-100 shadow-sm">
       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          {icon}
       </div>
       <div className="space-y-1">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">{description}</p>
       </div>
    </div>
  );
}

function FriendCard({ profile }: { profile: UserProfile }) {
  return (
    <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors group">
       <div className="relative">
         <img src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} className="w-14 h-14 rounded-2xl object-cover bg-gray-100" />
         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
       </div>
       <div className="flex-1">
          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{profile.displayName}</h4>
          <p className="text-[10px] text-gray-400 font-medium">
             {profile.cityCurrent ? `Habite à ${profile.cityCurrent}` : 'Quoto User'}
             {profile.country && ` • ${profile.country}`}
          </p>
       </div>
       <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
          <UserX size={20} />
       </button>
    </div>
  );
}

function RequestRow({ request, onAccept, onReject }: { request: any, onAccept: () => void, onReject: () => void }) {
  const user = request.user;
  return (
    <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
       <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
       <div className="flex-1">
          <h4 className="font-bold text-sm text-gray-800">{user.displayName}</h4>
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-0.5">Demande d'ami</p>
       </div>
       <div className="flex gap-2">
          <button onClick={onReject} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
          <button onClick={onAccept} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            <Check size={18} />
          </button>
       </div>
    </div>
  );
}

function SearchCard({ profile, onAdd }: { profile: UserProfile, onAdd: () => void }) {
  const [added, setAdded] = useState(false);
  
  const handleAdd = () => {
    onAdd();
    setAdded(true);
  };

  return (
    <div className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
       <img src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} className="w-14 h-14 rounded-2xl object-cover bg-gray-100" />
       <div className="flex-1">
          <h4 className="font-bold text-gray-900">{profile.displayName}</h4>
          <p className="text-xs text-gray-400">{profile.region || 'Quoto Creator'}</p>
       </div>
       <button 
         onClick={handleAdd}
         disabled={added}
         className={cn(
           "px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2",
           added ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
         )}
       >
         {added ? <Check size={16} /> : <UserPlus size={16} />}
         {added ? "Envoyé" : "Ajouter"}
       </button>
    </div>
  );
}
