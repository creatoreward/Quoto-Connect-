import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ChevronLeft, 
  Edit2, 
  Search, 
  MoreHorizontal, 
  Bell, 
  Camera,
  MapPin,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  Plus,
  Settings,
  HelpCircle,
  Users as UsersIcon,
  Check,
  X,
  Globe,
  Wallet,
  TrendingUp,
  Eye,
  Calendar,
  UserCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export function ProfileModule({ user, userProfile, setActiveTab }: { user: any, userProfile: UserProfile | null, setActiveTab: (tab: any) => void }) {
  const [activeSubTab, setActiveSubTab] = useState('Tout');
  const [friendsCount, setFriendsCount] = useState(0);
  const isSignedInLocal = !!user;
  const [isEditing, setIsEditing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  
  const [editForm, setEditForm] = useState({
    displayName: userProfile?.displayName || '',
    bio: userProfile?.bio || '',
    cityCurrent: userProfile?.cityCurrent || '',
    cityOrigin: userProfile?.cityOrigin || '',
    province: userProfile?.province || '',
    country: userProfile?.country || '',
    profession: userProfile?.profession || '',
    gender: userProfile?.gender || 'homme',
    birthDate: userProfile?.birthDate || ''
  });

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        cityCurrent: userProfile.cityCurrent || '',
        cityOrigin: userProfile.cityOrigin || '',
        province: userProfile.province || '',
        country: userProfile.country || '',
        profession: userProfile.profession || '',
        gender: userProfile.gender || 'homme',
        birthDate: userProfile.birthDate || ''
      });
    }
  }, [userProfile]);

  const handleUpdateProfile = async () => {
    if (!userProfile?.uid) return;
    try {
      await updateDoc(doc(db, 'users', userProfile.uid), editForm);
      setIsEditing(false);
      alert("Profil mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handlePhotoUpload = async (type: 'photo' | 'cover', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile?.uid) return;

    // Simulation de téléchargement (ici on pourrait utiliser Firebase Storage)
    // Pour l'instant on utilise un FileReader pour obtenir un base64 (démo)
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          [type === 'photo' ? 'photoURL' : 'coverURL']: base64
        });
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!userProfile?.uid || !isSignedInLocal) return;
    const q = query(collection(db, 'friendships'), where('uids', 'array-contains', userProfile.uid));
    const unsub = onSnapshot(q, (snap) => {
      setFriendsCount(snap.size);
    }, (err) => {
      console.error("Friendship query error:", err);
    });
    return () => unsub();
  }, [userProfile?.uid, isSignedInLocal]);

  const stats = [
    { label: 'vues totales', value: userProfile?.contentViewsTotal || 0 },
    { label: 'followers', value: userProfile?.followersCount || 0 },
    { label: 'suivi(e)s', value: userProfile?.followingCount || 0 },
    { label: 'amis', value: friendsCount, action: () => setActiveTab('friends') },
  ];

  if (showDashboard) {
    return <DashboardView userProfile={userProfile} setActiveTab={setActiveTab} onClose={() => setShowDashboard(false)} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-white min-h-screen pb-20 -m-4 lg:-m-6"
    >
      {/* Top Professional Toggle Bar */}
      <div className="bg-[#f0f2f5] px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Mode rémunéré actif</span>
          <HelpCircle size={16} className="text-gray-500" />
        </div>
        <button className="bg-white hover:bg-gray-50 border border-gray-300 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-sm">
          Gérer les revenus
        </button>
      </div>

      {/* Header Navigation */}
      <div className="px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-20 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('home')} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight truncate max-w-[150px]">
              {userProfile?.displayName || "Mon Profil"}
            </h1>
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">Profil Creator</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 hover:bg-gray-100 rounded-full">
            <Edit2 size={20} className={cn(isEditing ? "text-blue-500" : "text-black")} />
          </button>
          <Search size={20} />
          <MoreHorizontal size={20} />
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-slate-200 relative overflow-hidden group">
          {userProfile?.coverURL ? (
            <img src={userProfile.coverURL} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-300 flex items-center justify-center">
               <span className="text-slate-400 font-bold opacity-20 text-4xl">QUOTO CONNECT</span>
            </div>
          )}
          <label className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg cursor-pointer hover:bg-white transition-all">
            <Camera size={20} />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload('cover', e)} />
          </label>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-4 -mt-12 relative pb-4">
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 overflow-hidden ring-1 ring-gray-200 shadow-xl">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                    <User size={64} />
                  </div>
                )}
              </div>
              <label className="absolute bottom-2 right-0 bg-gray-200 p-2 rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-gray-300 transition-all">
                <Camera size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload('photo', e)} />
              </label>
            </div>
          </div>

          <div className="mt-4">
             <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-gray-900">{userProfile?.displayName || "Utilisateur Quoto"}</h2>
                {userProfile?.isVerified && (
                  <div className="bg-blue-500 text-white p-0.5 rounded-full inline-flex">
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
             </div>
             
             {/* Bio Section */}
             <p className="text-sm mt-2 text-gray-600 leading-relaxed font-medium">
               {userProfile?.bio || "Présentez-vous en quelques mots..."}
             </p>

             <div className="flex items-center gap-2 mt-4 flex-wrap overflow-x-auto no-scrollbar pb-1">
                {stats.map((stat, i) => (
                  <React.Fragment key={i}>
                    <button 
                      onClick={() => (stat as any).action ? (stat as any).action() : null}
                      className={cn("flex flex-col items-start min-w-[70px]", (stat as any).action ? "cursor-pointer" : "cursor-default")}
                    >
                      <span className="font-black text-lg text-gray-900">{stat.value}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{stat.label}</span>
                    </button>
                    {i < stats.length - 1 && <div className="h-6 w-px bg-gray-200 mx-1" />}
                  </React.Fragment>
                ))}
             </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
             <button 
               onClick={() => setShowDashboard(true)}
               className="bg-[#1877F2] text-white flex items-center justify-center gap-3 py-3 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-600 active:scale-[0.98] transition-all"
             >
                <LayoutDashboard size={20} />
                Mon Tableau de bord
             </button>
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-100 text-gray-900 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                   <Edit2 size={18} /> Modifier
                </button>
                <button className="bg-gray-100 text-gray-900 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                   <Settings size={18} /> Profil
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 mt-2">
         <div className="flex">
            {['Tout', 'Reels', 'Photos'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={cn(
                  "flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                  activeSubTab === tab ? "border-[#1877F2] text-[#1877F2]" : "border-transparent text-gray-400"
                )}
              >
                {tab}
              </button>
            ))}
         </div>
      </div>

      {/* Profile Details & Edit Form */}
      <div className="p-5 space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">A Propos de moi</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold text-xs">Modifier tout</button>
            )}
         </div>

         <AnimatePresence mode="wait">
           {isEditing ? (
             <motion.div 
               key="edit-form"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-xl space-y-5"
             >
               <h4 className="font-black text-center text-lg">Éditer le profil</h4>
               
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Nom d'affichage</label>
                    <input 
                      value={editForm.displayName} 
                      onChange={e => setEditForm({...editForm, displayName: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Ma Bio / Devise</label>
                    <textarea 
                      value={editForm.bio} 
                      onChange={e => setEditForm({...editForm, bio: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm h-24 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Profession</label>
                      <input 
                        value={editForm.profession} 
                        onChange={e => setEditForm({...editForm, profession: e.target.value})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Genre</label>
                      <select 
                        value={editForm.gender} 
                        onChange={e => setEditForm({...editForm, gender: e.target.value as any})}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm appearance-none"
                      >
                        <option value="homme">Homme</option>
                        <option value="femme">Femme</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Ville Actuelle</label>
                      <input value={editForm.cityCurrent} onChange={e => setEditForm({...editForm, cityCurrent: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase ml-2 block mb-1">Ville d'Origine</label>
                      <input value={editForm.cityOrigin} onChange={e => setEditForm({...editForm, cityOrigin: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm" />
                    </div>
                  </div>
               </div>

               <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-black uppercase text-xs">Annuler</button>
                  <button onClick={handleUpdateProfile} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-blue-100">
                    Mettre à jour
                  </button>
               </div>
             </motion.div>
           ) : (
             <motion.div 
               key="profile-details"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-5"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <DetailItem icon={<Briefcase />} label="Profession" value={userProfile?.profession || "Non renseigné"} />
                   <DetailItem icon={<UserCircle />} label="Genre" value={userProfile?.gender || "Non renseigné"} />
                   <DetailItem icon={<Calendar />} label="Naissance" value={userProfile?.birthDate || "Non renseigné"} />
                   <DetailItem icon={<MapPin />} label="Lieu" value={userProfile?.cityCurrent || "Non renseigné"} />
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
       <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
          {React.cloneElement(icon as any, { size: 20 })}
       </div>
       <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
          <p className="font-bold text-gray-900">{value}</p>
       </div>
    </div>
  );
}

function DashboardView({ userProfile, onClose, setActiveTab }: { userProfile: UserProfile | null, onClose: () => void, setActiveTab: (tab: any) => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="bg-[#f8f9fc] min-h-screen pb-24 -m-4 lg:-m-6 relative overflow-y-auto h-screen"
    >
       <div className="bg-white p-6 rounded-b-[3rem] shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-4 mb-8">
             <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                <ChevronLeft size={24} />
             </button>
             <h2 className="text-xl font-black uppercase tracking-tight">Tableau de bord</h2>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">Solde Total</p>
                <div className="flex items-baseline gap-2">
                   <h1 className="text-4xl font-black">{userProfile?.balance?.toFixed(2) || "0.00"}</h1>
                   <span className="text-xl font-bold opacity-70">$</span>
                </div>
                <div className="mt-8 flex gap-3">
                   <button 
                     onClick={() => {
                        setActiveTab('wallet');
                        onClose();
                     }}
                     className="flex-1 bg-white/20 backdrop-blur-md rounded-2xl py-3 font-bold text-sm hover:bg-white/30 transition-all active:scale-95"
                   >
                      Retirer
                   </button>
                   <button 
                     onClick={() => setShowDetails(!showDetails)}
                     className="flex-1 bg-black/20 backdrop-blur-md rounded-2xl py-3 font-bold text-sm hover:bg-black/30 transition-all active:scale-95"
                   >
                      Détails
                   </button>
                </div>
             </div>
             <Wallet className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 rotate-12" />
          </div>
       </div>

       <div className="p-6 space-y-6">
          <AnimatePresence>
            {showDetails && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-sm space-y-3 overflow-hidden"
              >
                 <h4 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">Répartition des gains</h4>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Gains par publicités vues</span>
                    <span className="font-black text-blue-600">${(userProfile?.adRevenueRewarded || 0).toFixed(4)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Gains créateur (vos contenus)</span>
                    <span className="font-black text-green-600">${(userProfile?.adRevenueCreator || 0).toFixed(4)}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Pièces collectées (Éclats)</span>
                    <span className="font-black text-orange-500">{userProfile?.coins || 0} QC</span>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          <section className="space-y-4">
             <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest ml-1">Performances Réseau</h3>
             <div className="grid grid-cols-2 gap-4">
                <DashboardCard icon={<TrendingUp />} color="orange" label="Vues Contenu" value={userProfile?.contentViewsTotal || 0} />
                <DashboardCard icon={<Eye />} color="blue" label="Vidéos Regardées" value={userProfile?.videosWatchedTotal || 0} />
                <DashboardCard icon={<Plus />} color="green" label="Gains Créateur" value={`$ ${(userProfile?.adRevenueCreator || 0).toFixed(3)}`} />
                <DashboardCard icon={<UsersIcon />} color="purple" label="Fans" value={userProfile?.followersCount || 0} />
             </div>
          </section>

          <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
             <div className="flex items-center justify-between">
                <h4 className="font-black text-sm uppercase tracking-tight">Status Créateur</h4>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                  userProfile?.creatorStatus === 'verified' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                )}>
                   {userProfile?.creatorStatus || "Standard"}
                </div>
             </div>
             <div className="space-y-3">
                <div className="flex justify-between text-xs">
                   <span className="text-gray-500 font-bold">Progression certification</span>
                   <span className="font-black">45%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[45%]" />
                </div>
                <p className="text-[10px] text-gray-400 italic">Continuez à publier des Reels pour atteindre les 10,000 vues totales.</p>
             </div>
          </section>
       </div>
    </motion.div>
  );
}

function DashboardCard({ icon, color, label, value }: { icon: React.ReactNode, color: string, label: string, value: string | number }) {
  const colors: any = {
    orange: "bg-orange-50 text-orange-500",
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    purple: "bg-purple-50 text-purple-500"
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100/50 flex flex-col gap-3">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
          {React.cloneElement(icon as any, { size: 20 })}
       </div>
       <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">{label}</p>
          <p className="text-lg font-black text-gray-900">{value}</p>
       </div>
    </div>
  );
}
