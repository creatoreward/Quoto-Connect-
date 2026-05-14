import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Shield, LogOut, LayoutDashboard, MessageCircle, 
  Users, Play, Store, Flag, Clock, Gift, Calendar, Trophy, Wallet,
  CheckCircle, Globe, Instagram, ChevronDown, ChevronLeft,
  UserPlus, Heart, Search, HelpCircle, Info, Lock, Smartphone,
  BookOpen, Eye, CreditCard, AlertTriangle, UserMinus, PlusCircle,
  Banknote, Coins, Bell, Mail, Terminal, Zap, Send, Activity,
  Cpu, Database
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp, getDocs, orderBy } from 'firebase/firestore';
import { Quote, UserProfile, RemoteConfig, DeveloperTask } from '../types';
import { cn } from '../lib/utils';
import { configService } from '../services/configService';

interface MenuProps {
  user: any;
  quotes: Quote[];
  onLogout: () => void;
  setActiveTab: (tab: any) => void;
}

function DeveloperModeManager({ user }: { user: any }) {
  const [devTasks, setDevTasks] = useState<DeveloperTask[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as any });

  useEffect(() => {
    const qTasks = query(collection(db, 'dev_tasks'), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setDevTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as DeveloperTask)));
    });
    return () => unsubTasks();
  }, []);

  return (
    <>
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact IA (Developer Mode)</h3>
           <Terminal size={14} className="text-gray-400" />
        </div>

        <div className="bg-white p-4 rounded-3xl border border-gray-100 space-y-3">
           <input 
             value={newTask.title}
             onChange={(e) => setNewTask({...newTask, title: e.target.value})}
             placeholder="Nom de la nouvelle fonction..." 
             className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm" 
           />
           <textarea 
             value={newTask.description}
             onChange={(e) => setNewTask({...newTask, description: e.target.value})}
             placeholder="Expliquez à l'IA ce qu'elle doit ajouter (ex: Nouveau module Crypto)" 
             className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm h-20" 
           />
           <div className="flex gap-2">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setNewTask({...newTask, priority: p as any})}
                  className={cn(
                    "flex-1 py-1 text-[10px] rounded-lg font-bold uppercase",
                    newTask.priority === p ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
                  )}
                >
                  {p}
                </button>
              ))}
           </div>
           <button 
             onClick={async () => {
               if (!newTask.title) return;
               await addDoc(collection(db, 'dev_tasks'), {
                  ...newTask,
                  adminId: user.uid,
                  status: 'todo',
                  createdAt: serverTimestamp()
               });
               setNewTask({ title: '', description: '', priority: 'medium' });
               alert("Instructions envoyées à l'IA (Creator Reward System).");
             }}
             className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black flex items-center justify-center gap-2"
           >
              <Send size={16} /> Envoyer à l'IA
           </button>
        </div>

        <div className="space-y-3">
           {devTasks.map(task => (
             <div key={task.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                <div className={cn(
                   "p-2 rounded-xl mt-0.5",
                   task.priority === 'urgent' ? "bg-red-50" : task.priority === 'high' ? "bg-orange-50" : "bg-blue-50"
                )}>
                   {task.priority === 'urgent' ? <Zap size={14} className="text-red-500" /> : <Activity size={14} className="text-blue-500" />}
                </div>
                <div className="flex-1">
                   <h4 className="font-bold text-xs uppercase tracking-tight">{task.title}</h4>
                   <p className="text-[10px] text-gray-400 font-medium italic mt-1 leading-relaxed">"{task.description}"</p>
                </div>
                <span className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase">{task.status}</span>
             </div>
           ))}
        </div>
      </section>
    </>
  );
}

export function MenuModule({ user, quotes, onLogout, setActiveTab }: MenuProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showSubContent, setShowSubContent] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<'status' | 'users' | 'payments' | 'ads' | 'challenges' | 'master' | 'ranking'>('status');
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
  const [localConfig, setLocalConfig] = useState<Partial<RemoteConfig>>({});
  
  // Admin Login State
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const isAdminEmail = user.email === 'ngoyelie866@gmail.com' || user.email === 'developpeurhacker01@gmail.com';
  // Code par défaut modifiable
  const ADMIN_DEFAULT_CODE = "QC2026"; 

  useEffect(() => {
    if (isAdminEmail && isAdminAuthenticated) {
      if (activeAdminTab === 'users' || activeAdminTab === 'payments') {
        const q = query(collection(db, 'users'));
        const unsub = onSnapshot(q, (snap) => {
          setAdminUsers(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
        });
        return () => unsub();
      }
      
      if (activeAdminTab === 'master') {
        const unsubConfig = configService.subscribe((config) => {
          setRemoteConfig(config);
          // Only update local components if not currently focused to avoid jumpy cursor
          if (document.activeElement?.tagName !== 'INPUT') {
            setLocalConfig(prev => ({ ...prev, ...config }));
          }
        });
        return () => {
          unsubConfig();
        };
      }
    }
  }, [isAdminEmail, isAdminAuthenticated, activeAdminTab]);

  const syncConfig = async (updates: Partial<RemoteConfig>) => {
    await configService.updateConfig(updates);
  };

  const handleUpdateStatus = async (userId: string, status: 'active' | 'alerted' | 'suspended') => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { status });
    
    // Add internal notification
    await addDoc(collection(db, 'notifications'), {
      userId,
      type: 'alert',
      message: status === 'alerted' ? 'Votre compte a reçu un avertissement de la part de l\'admin.' : 'Votre statut a été mis à jour.',
      createdAt: serverTimestamp()
    });
  };

  const handleTogglePayment = async (userId: string, isSuspended: boolean) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isPaymentSuspended: isSuspended });
  };

  const handleAddCoins = async (userId: string) => {
    const amount = prompt('Combien d\'Éclats (Pièces) ajouter ?');
    if (amount) {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        coins: increment(parseInt(amount)),
        balance: increment(parseInt(amount) * 0.01) // Example conversion
      });
    }
  };

  const menuItems = [
    { id: 'home', label: "Fil d'actualité", icon: <LayoutDashboard className="text-blue-500" />, tab: 'home' },
    { id: 'discussion', label: 'Messages', icon: <MessageCircle className="text-purple-500" />, tab: 'discussion' },
    { id: 'groups', label: 'Groupes', icon: <Users className="text-indigo-500" />, tab: 'groups' },
    { id: 'friends', label: 'Ami(e)s', icon: <Users className="text-blue-400" />, tab: 'friends' },
    { id: 'video', label: 'Reels', icon: <Play className="text-pink-500" />, tab: 'video' },
    { id: 'marketplace', label: 'Marketplace', icon: <Store className="text-blue-600" />, tab: 'marketplace' },
    { id: 'wallet', label: 'Portefeuille', icon: <Wallet className="text-amber-500" />, tab: 'wallet' },
    { id: 'pages', label: 'Pages', icon: <Flag className="text-orange-500" />, tab: 'pages' },
    { id: 'challenges', label: 'Défis & Gains', icon: <Trophy className="text-yellow-500" />, tab: 'challenges' },
    { id: 'creator', label: 'Studio Créateur', icon: <PlusCircle className="text-pink-500" />, tab: 'creator' },
    { id: 'birthdays', label: 'Anniversaires', icon: <Gift className="text-pink-400" />, tab: 'birthdays' },
    { id: 'events', label: 'Évènements', icon: <Calendar className="text-red-400" />, tab: 'events' },
    { id: 'verified', label: 'Quoto Verified', icon: <CheckCircle className="text-blue-500" /> },
  ];

  const handleToggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderSubContent = () => {
    switch (showSubContent) {
      case 'security':
        return (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] p-6 pt-20">
            <button onClick={() => setShowSubContent(null)} className="absolute top-6 left-6 p-2"><ChevronLeft /></button>
            <h2 className="text-2xl font-bold mb-6">Paramètres de sécurité</h2>
            <div className="space-y-4">
              <SecurityItem icon={<Lock />} title="Changer le mot de passe" />
              <SecurityItem icon={<Shield />} title="Authentification à deux facteurs" />
              <SecurityItem icon={<Smartphone />} title="Appareils connectés" />
            </div>
          </motion.div>
        );
      case 'about':
        return (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] p-6 pt-20 overflow-y-auto">
            <button onClick={() => setShowSubContent(null)} className="absolute top-6 left-6 p-2"><ChevronLeft /></button>
            <h2 className="text-2xl font-bold mb-6">À propos de Quoto Connect</h2>
            <div className="prose prose-sm space-y-4">
              <p className="text-gray-600">
                Quoto Connect est la première plateforme sociale fusionnant l'inspiration par intelligence artificielle et la monétisation directe pour les créateurs d'Afrique centrale et du monde.
              </p>
              <h3 className="font-bold text-lg">Vision</h3>
              <p>Une plateforme tout-en-un regroupant des services (Social, Finance, AI, Divertissement) pour booster la productivité et la créativité.</p>
              <h3 className="font-bold text-lg">Équipe</h3>
              <p>Développé par Quoto Connect Dev Team.</p>
            </div>
          </motion.div>
        );
      case 'how-to':
        return (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] p-6 pt-20 overflow-y-auto">
            <button onClick={() => setShowSubContent(null)} className="absolute top-6 left-6 p-2"><ChevronLeft /></button>
            <h2 className="text-2xl font-bold mb-6">Mode d'utilisation</h2>
            <div className="space-y-6">
              <UsageStep num="1" title="Créer une Citation IA" desc="Utilisez le générateur Gemini sur l'accueil pour créer du contenu unique." />
              <UsageStep num="2" title="Partager & Engager" desc="Postez vos créations dans des groupes ou sur votre Page pour gagner des followers." />
              <UsageStep num="3" title="Monétiser" desc="Plus vous interagissez, plus votre dashboard AdMob génère de revenus via la médiation Quoto." />
            </div>
          </motion.div>
        );
      case 'admin-console':
        if (!isAdminAuthenticated) {
          return (
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                   <Lock size={40} />
                </div>
                <h2 className="text-2xl font-black mb-2">Accès Restreint</h2>
                <p className="text-gray-500 text-center mb-8">Bonjour {user.displayName}, veuillez entrer le code administrateur Quoto Connect.</p>
                <div className="w-full max-w-xs space-y-4">
                   <input 
                     type="password"
                     value={adminCodeInput}
                     onChange={(e) => setAdminCodeInput(e.target.value)}
                     placeholder="Code de sécurité"
                     className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold tracking-widest"
                   />
                   <button 
                     onClick={() => {
                        if (adminCodeInput === ADMIN_DEFAULT_CODE) {
                           setIsAdminAuthenticated(true);
                        } else {
                           alert("Code incorrect.");
                        }
                     }}
                     className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20"
                   >
                      Déverrouiller
                   </button>
                   <button onClick={() => setShowSubContent(null)} className="w-full py-2 text-sm text-gray-400 font-bold">Retour au menu</button>
                </div>
             </motion.div>
          );
        }
        return (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[60] flex flex-col pt-16">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSubContent(null)} className="p-2 -ml-2"><ChevronLeft /></button>
                <h2 className="text-xl font-bold">Creator Reward Console</h2>
              </div>
            </div>
            
            <div className="flex bg-gray-50 p-1 m-4 rounded-xl border border-gray-200 overflow-x-auto no-scrollbar">
               <button onClick={() => setActiveAdminTab('status')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'status' ? "bg-white shadow-sm text-blue-500" : "text-gray-500")}>Modules</button>
               <button onClick={() => setActiveAdminTab('users')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'users' ? "bg-white shadow-sm text-blue-500" : "text-gray-500")}>Utilisateurs</button>
               <button onClick={() => setActiveAdminTab('payments')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'payments' ? "bg-white shadow-sm text-blue-500" : "text-gray-500")}>Pay</button>
               <button onClick={() => setActiveAdminTab('challenges')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'challenges' ? "bg-white shadow-sm text-blue-500" : "text-gray-500")}>Défis</button>
               <button onClick={() => setActiveAdminTab('ads')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'ads' ? "bg-white shadow-sm text-blue-500" : "text-gray-500")}>Analyse Pub</button>
               <button onClick={() => setActiveAdminTab('master')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'master' ? "bg-white shadow-sm text-red-500" : "text-gray-500")}>Master Control</button>
               <button onClick={() => setActiveAdminTab('ranking')} className={cn("flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap", activeAdminTab === 'ranking' ? "bg-white shadow-sm text-blue-500" : "text-gray-500")}>Classement</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
               {activeAdminTab === 'status' && (
                 <div className="grid grid-cols-2 gap-3 py-4">
                    {remoteConfig?.modules && Object.entries(remoteConfig.modules).map(([key, module]) => (
                      <AdminModuleCard 
                        key={key}
                        name={module.name} 
                        status={module.status} 
                        enabled={module.enabled}
                        onToggle={() => {
                          const updatedModules = { ...remoteConfig.modules };
                          updatedModules[key] = {
                            ...module,
                            enabled: !module.enabled
                          };
                          syncConfig({ modules: updatedModules });
                        }}
                        onEdit={() => {
                          const newName = prompt("Nouveau nom du module :", module.name);
                          const newStatus = prompt("Nouveau statut (complete, partial, beta, stable, hidden) :", module.status);
                          if (newName || newStatus) {
                            const updatedModules = { ...remoteConfig.modules };
                            updatedModules[key] = {
                              ...module,
                              name: newName || module.name,
                              status: (newStatus || module.status) as any
                            };
                            syncConfig({ modules: updatedModules });
                          }
                        }}
                      />
                    ))}
                    <button 
                      onClick={() => {
                        const id = prompt("ID du nouveau module (ex: ai_chat) :");
                        const name = prompt("Nom du module :");
                        if (id && name) {
                          const updatedModules = { ...(remoteConfig?.modules || {}) };
                          updatedModules[id] = { name, status: 'beta', enabled: true };
                          syncConfig({ modules: updatedModules });
                        }
                      }}
                      className="bg-gray-50 border-2 border-dashed border-gray-200 p-3 rounded-xl flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                      <PlusCircle size={20} />
                    </button>
                 </div>
               )}

               {activeAdminTab === 'users' && (
                 <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Surveillance Générale</h3>
                       <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{adminUsers.length} inscrits</span>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden overflow-x-auto">
                       <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                             <tr>
                                <th className="p-3 font-bold">User</th>
                                <th className="p-3 font-bold">Solde/Coins</th>
                                <th className="p-3 font-bold">Statut</th>
                                <th className="p-3 font-bold">Actions</th>
                             </tr>
                          </thead>
                          <tbody>
                             {adminUsers.map((u) => (
                               <tr key={u.uid} className="border-b border-gray-50">
                                  <td className="p-3">
                                     <p className="font-bold truncate max-w-[100px]">{u.displayName}</p>
                                     <p className="text-[10px] text-gray-400">{u.email}</p>
                                  </td>
                                  <td className="p-3">
                                     <p className="font-bold text-blue-600">{u.balance?.toFixed(2)}$</p>
                                     <p className="text-[10px] text-gray-400">{u.coins || 0} Pièces</p>
                                  </td>
                                  <td className="p-3">
                                     <span className={cn(
                                       "text-[10px] px-2 py-1 rounded-full font-bold",
                                       u.status === 'suspended' ? "bg-red-50 text-red-600" : 
                                       u.status === 'alerted' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
                                     )}>{u.status || 'active'}</span>
                                  </td>
                                  <td className="p-3">
                                     <div className="flex gap-2">
                                        <button onClick={() => handleAddCoins(u.uid)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><PlusCircle size={16} /></button>
                                        <button onClick={() => handleUpdateStatus(u.uid, u.status === 'alerted' ? 'active' : 'alerted')} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"><AlertTriangle size={16} /></button>
                                        <button onClick={() => handleTogglePayment(u.uid, !u.isPaymentSuspended)} className={cn("p-1.5 rounded", u.isPaymentSuspended ? "text-red-500 bg-red-50" : "text-gray-400 hover:bg-gray-100")}><Banknote size={16} /></button>
                                     </div>
                                  </td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}

               {activeAdminTab === 'payments' && (
                 <div className="space-y-4 py-4">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Éligibilité au Retrait</h3>
                    <div className="grid grid-cols-1 gap-3">
                       <ThresholdCard title="Afrique / Mobile Money" amount="$50" icon={<Smartphone size={18} />} color="green" />
                       <ThresholdCard title="Crypto USDT (BEP20)" amount="$30" icon={<Coins size={18} />} color="blue" />
                       <ThresholdCard title="Visa / Banque" amount="$100" icon={<CreditCard size={18} />} color="indigo" />
                       <ThresholdCard title="Europe" amount="70€" icon={<Globe size={18} />} color="amber" />
                    </div>

                    <div className="mt-8">
                       <h4 className="text-xs font-bold text-gray-400 mb-4 px-1">UTILISATEURS AYANT ATTEINT LE SEUIL</h4>
                       <div className="space-y-2">
                          {adminUsers.filter(u => {
                            const threshold = u.region === 'Africa' ? 50 : u.region === 'Europe' ? 70 : 100;
                            return (u.balance || 0) >= threshold;
                          }).map(u => (
                            <div key={u.uid} className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                               <div>
                                  <p className="font-bold text-green-800">{u.displayName}</p>
                                  <p className="text-xs text-green-600">Solde: {u.balance?.toFixed(2)}$</p>
                               </div>
                               <button className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold">Payer UI</button>
                            </div>
                          ))}
                          {adminUsers.filter(u => (u.balance || 0) >= 30).length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-8 italic">Aucun utilisateur en attente de seuil.</p>
                          )}
                       </div>
                    </div>
                 </div>
               )}

               {activeAdminTab === 'ads' && (
                 <div className="space-y-4 py-4 pb-20">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Analyse de Diffusion (Platform Views)</h3>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                             <p className="text-[10px] text-blue-600 font-bold uppercase mb-1">Vues Totales Platform</p>
                             <p className="text-2xl font-black text-blue-800">
                                {adminUsers.reduce((acc, u) => acc + (u.contentViewsTotal || 0), 0)}
                             </p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                             <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">Total Vidéos Reward</p>
                             <p className="text-2xl font-black text-orange-800">
                                {adminUsers.reduce((acc, u) => acc + (u.videosWatchedTotal || 0), 0)}
                             </p>
                          </div>
                       </div>

                       <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-bold text-gray-500">Revenue Estimé Plateforme (35%)</span>
                             <span className="font-black text-gray-900">
                                {adminUsers.reduce((acc, u) => acc + (u.totalAdRevenueGenerated || 0) * 0.35, 0).toFixed(4)} $
                             </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                             <span className="font-bold text-gray-500">Revenue Distribué (65%)</span>
                             <span className="font-black text-blue-600">
                                {adminUsers.reduce((acc, u) => acc + (u.totalAdRevenueGenerated || 0) * 0.65, 0).toFixed(4)} $
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {activeAdminTab === 'challenges' && (
                 <div className="space-y-4 py-4 pb-20">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Lancer un Défi</h3>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                       <div className="space-y-3">
                          <input id="chal_title" placeholder="Titre du défi" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2" />
                          <textarea id="chal_desc" placeholder="Description détaillée" className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 h-20" />
                          <div className="grid grid-cols-2 gap-2">
                             <select id="chal_type" className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm outline-none">
                                <option value="follow">Suivre ce compte</option>
                                <option value="post_reels">Publier des Reels</option>
                                <option value="weekly_views">Vues Hebdomadaires</option>
                                <option value="engagement">Likes/Comm.</option>
                             </select>
                             <input id="chal_target" type="number" placeholder="Objectif (ex: 100)" className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             <input id="chal_money" type="number" step="0.01" placeholder="Gain $" className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm" />
                             <input id="chal_points" type="number" placeholder="Points QC" className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm" />
                          </div>
                       </div>
                       <button 
                         onClick={async () => {
                           const title = (document.getElementById('chal_title') as HTMLInputElement).value;
                           const desc = (document.getElementById('chal_desc') as HTMLTextAreaElement).value;
                           const type = (document.getElementById('chal_type') as HTMLSelectElement).value;
                           const target = parseInt((document.getElementById('chal_target') as HTMLInputElement).value);
                           const money = parseFloat((document.getElementById('chal_money') as HTMLInputElement).value);
                           const points = parseInt((document.getElementById('chal_points') as HTMLInputElement).value);

                           if (title && target) {
                              await addDoc(collection(db, 'challenges'), {
                                 title, description: desc, type, targetCount: target,
                                 rewardMoney: money || 0, rewardPoints: points || 0,
                                 isActive: true, createdAt: serverTimestamp()
                              });
                              alert("Défi lancé !");
                           }
                         }}
                         className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-black shadow-lg"
                       >
                          Lancer le Défi
                       </button>
                    </div>
                 </div>
               )}

                {activeAdminTab === 'ranking' && (
                  <div className="space-y-6 py-4 pb-24">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Classement des Créateurs</h3>
                       <Trophy size={18} className="text-yellow-500" />
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden overflow-x-auto shadow-sm">
                       <table className="w-full text-left text-[11px]">
                          <thead className="bg-gray-50 text-gray-400 border-b border-gray-100 font-bold uppercase tracking-tighter">
                             <tr>
                                <th className="p-3">Rang</th>
                                <th className="p-3">Utilisateur</th>
                                <th className="p-3 text-green-600">Gains Totaux</th>
                                <th className="p-3">Solde</th>
                                <th className="p-3">Retiré</th>
                                <th className="p-3">Unlock Pub</th>
                                <th className="p-3">Watch Pub</th>
                                <th className="p-3">Contenus</th>
                                <th className="p-3">Défis</th>
                                <th className="p-3">Invites</th>
                                <th className="p-3">Evènements</th>
                                <th className="p-3">Anniversaires</th>
                                <th className="p-3">Bonus Alpha</th>
                             </tr>
                          </thead>
                          <tbody>
                             {adminUsers
                               .sort((a, b) => ((b.balance || 0) + (b.totalWithdrawn || 0)) - ((a.balance || 0) + (a.totalWithdrawn || 0)))
                               .map((u, index) => (
                               <tr key={u.uid} className="border-b border-gray-50 hover:bg-gray-50">
                                  <td className="p-3 font-black text-gray-400">{index + 1}</td>
                                  <td className="p-3">
                                     <p className="font-bold text-gray-900 truncate max-w-[80px]">{u.displayName}</p>
                                  </td>
                                  <td className="p-3 font-bold text-green-600 tracking-tighter">
                                     {((u.balance || 0) + (u.totalWithdrawn || 0)).toFixed(2)}$
                                  </td>
                                  <td className="p-3 font-medium text-gray-900">{(u.balance || 0).toFixed(2)}$</td>
                                  <td className="p-3 text-red-500 font-medium">{(u.totalWithdrawn || 0).toFixed(2)}$</td>
                                  <td className="p-3">{(u.revenueAdsForUnlock || 0).toFixed(3)}$</td>
                                  <td className="p-3">{(u.adRevenueRewarded || 0).toFixed(3)}$</td>
                                  <td className="p-3">{(u.adRevenueCreator || 0).toFixed(3)}$</td>
                                  <td className="p-3">{(u.revenueChallenges || 0).toFixed(2)}$</td>
                                  <td className="p-3">{(u.revenueInvites || 0).toFixed(2)}$</td>
                                  <td className="p-3">{(u.revenueEvents || 0).toFixed(2)}$</td>
                                  <td className="p-3">{(u.revenueBirthdays || 0).toFixed(2)}$</td>
                                  <td className="p-3 font-black text-purple-600">{(u.revenueCreatorBonus || 0).toFixed(2)}$</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                )}

                {activeAdminTab === 'master' && (
                  <div className="space-y-6 py-4 pb-24">
                      <section className="bg-[#1a1a1a] text-white p-6 rounded-[32px] space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                           <div className="w-10 h-10 bg-yellow-400/10 rounded-2xl flex items-center justify-center text-yellow-400">
                              <Zap size={20} />
                           </div>
                           <div>
                              <h3 className="font-bold text-sm">Configuration Maître</h3>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Services & AdMob</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-bold text-white/40 uppercase ml-1">App ID AdMob</label>
                                 <input 
                                   placeholder="ca-app-pub-..."
                                   value={localConfig?.adMobAppId || ''}
                                   onChange={(e) => setLocalConfig(prev => ({ ...prev, adMobAppId: e.target.value }))}
                                   onBlur={(e) => syncConfig({ adMobAppId: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-bold text-white/40 uppercase ml-1">Rewarded Unit ID</label>
                                 <input 
                                   placeholder="ca-app-pub-..."
                                   value={localConfig?.adMobRewardedId || ''}
                                   onChange={(e) => setLocalConfig(prev => ({ ...prev, adMobRewardedId: e.target.value }))}
                                   onBlur={(e) => syncConfig({ adMobRewardedId: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[10px] font-bold text-white/40 uppercase ml-1">Interstitial Unit ID</label>
                                 <input 
                                   placeholder="ca-app-pub-..."
                                   value={localConfig?.adMobInterstitialId || ''}
                                   onChange={(e) => setLocalConfig(prev => ({ ...prev, adMobInterstitialId: e.target.value }))}
                                   onBlur={(e) => syncConfig({ adMobInterstitialId: e.target.value })}
                                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                                 />
                              </div>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3 pt-2">
                           <ConfigToggle 
                             label="Mode Maintenance" 
                             active={remoteConfig?.maintenanceMode || false} 
                             onToggle={() => configService.updateConfig({ maintenanceMode: !remoteConfig?.maintenanceMode })}
                           />
                           <ConfigToggle 
                             label="Activé AdMob (Média)" 
                             active={remoteConfig?.adMobEnabled || false} 
                             onToggle={() => configService.updateConfig({ adMobEnabled: !remoteConfig?.adMobEnabled })}
                           />
                        </div>

                         <div className="pt-2">
                           <label className="text-[10px] font-bold text-gray-500 uppercase">Commission Plateforme ({((remoteConfig?.platformCommission || 0.35) * 100).toFixed(0)}%)</label>
                           <input 
                             type="range" min="0.1" max="0.5" step="0.05"
                             value={localConfig?.platformCommission || 0.35}
                             onChange={(e) => setLocalConfig(prev => ({ ...prev, platformCommission: parseFloat(e.target.value) }))}
                             onMouseUp={(e: any) => syncConfig({ platformCommission: parseFloat(e.target.value) })}
                             className="w-full accent-blue-500"
                           />
                        </div>

                        <div className="space-y-6 pt-6 border-t border-white/10">
                           <div className="flex items-center gap-2">
                              <Database size={16} className="text-blue-400" />
                              <h3 className="font-bold uppercase text-[10px] tracking-widest text-white/60">Clés API & Intégrations</h3>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-4">
                              <IntegrationKeyInput 
                                label="Clé API Gemini (AI)" 
                                value={localConfig?.integrations?.gemini || ''} 
                                onChange={(val) => syncConfig({ integrations: { ...remoteConfig?.integrations, gemini: val } })}
                              />
                              <IntegrationKeyInput 
                                label="NowPayments API Key" 
                                value={localConfig?.integrations?.nowPayments || ''} 
                                onChange={(val) => syncConfig({ integrations: { ...remoteConfig?.integrations, nowPayments: val } })}
                              />
                              <IntegrationKeyInput 
                                label="Flutterwave Public Key" 
                                value={localConfig?.integrations?.flutterwavePublic || ''} 
                                onChange={(val) => syncConfig({ integrations: { ...remoteConfig?.integrations, flutterwavePublic: val } })}
                              />
                              <IntegrationKeyInput 
                                label="Flutterwave Secret Key" 
                                value={localConfig?.integrations?.flutterwaveSecret || ''} 
                                onChange={(val) => syncConfig({ integrations: { ...remoteConfig?.integrations, flutterwaveSecret: val } })}
                                isSecret
                              />
                              <IntegrationKeyInput 
                                label="TikTok Pixel ID" 
                                value={localConfig?.integrations?.tiktokPixelId || ''} 
                                onChange={(val) => syncConfig({ integrations: { ...remoteConfig?.integrations, tiktokPixelId: val } })}
                              />
                               <IntegrationKeyInput 
                                label="Facebook App ID" 
                                value={localConfig?.integrations?.facebookAppId || ''} 
                                onChange={(val) => syncConfig({ integrations: { ...remoteConfig?.integrations, facebookAppId: val } })}
                              />
                           </div>
                        </div>

                        <div className="pt-4 space-y-2">
                           <div className="flex items-center gap-2">
                             <Terminal size={14} className="text-gray-400" />
                             <label className="text-[10px] font-bold text-gray-500 uppercase">Scripts & Configs Personnalisés (JSON/JS)</label>
                           </div>
                           <textarea 
                             placeholder="Insérez votre script ou configuration ici..."
                             value={localConfig?.customScripts || ''}
                             onChange={(e) => setLocalConfig(prev => ({ ...prev, customScripts: e.target.value }))}
                             onBlur={(e) => syncConfig({ customScripts: e.target.value })}
                             className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[10px] font-mono h-32 focus:ring-1 focus:ring-blue-500 outline-none"
                           />
                           <p className="text-[9px] text-gray-500 italic">Ces scripts peuvent être injectés dynamiquement dans l'application pour des modifications en temps réel.</p>
                        </div>
                     </section>

                     <DeveloperModeManager user={user} />
                  </div>
                )}

                {activeAdminTab === 'ads' && (() => {
                  const totalGross = adminUsers.reduce((sum, u) => sum + (u.totalAdRevenueGenerated || 0), 0);
                  const platformShare = totalGross * 0.35;
                  const usersShare = totalGross * 0.65;
                  
                  const boostedUsersCount = adminUsers.filter(u => u.videosWatchedTotal > 0).length;

                  return (
                    <div className="space-y-4 py-4 px-4 overflow-y-auto pb-20">
                       <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Analyse Revenus AdMob</h3>
                       
                       <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-600 p-4 rounded-3xl text-white">
                             <p className="text-[10px] font-bold opacity-80 uppercase">Total Brut (Médiation)</p>
                             <p className="text-xl font-black">{totalGross.toFixed(3)}$</p>
                          </div>
                          <div className="bg-green-600 p-4 rounded-3xl text-white">
                             <p className="text-[10px] font-bold opacity-80 uppercase">Ma Part (35%)</p>
                             <p className="text-xl font-black">{platformShare.toFixed(3)}$</p>
                          </div>
                       </div>

                       <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                             <p className="text-sm font-bold text-gray-400">Distribué aux utilisateurs (65%)</p>
                             <p className="text-sm font-black text-gray-900">{usersShare.toFixed(3)}$</p>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                             <div className="h-full bg-blue-500" style={{ width: '35%' }} />
                             <div className="h-full bg-green-500" style={{ width: '65%' }} />
                          </div>
                          <p className="text-[10px] text-gray-400 italic font-medium">Répartition automatique : 35% plateforme / 65% créateurs.</p>
                       </div>

                       <div className="space-y-2">
                          <h4 className="text-xs font-bold text-gray-400 px-2">STATS PAR UTILISATEUR (BOOSTS)</h4>
                          {adminUsers.filter(u => u.totalAdRevenueGenerated > 0).map(u => (
                            <div key={u.uid} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                               <div>
                                  <p className="font-bold text-sm">{u.displayName}</p>
                                  <p className="text-[10px] text-gray-500 italic">{u.videosWatchedTotal} vidéos regardées (Appels/Boosts)</p>
                               </div>
                               <div className="text-right">
                                  <p className="font-black text-blue-600 text-sm">+{u.totalAdRevenueGenerated?.toFixed(4)}$</p>
                                  <p className="text-[9px] text-green-500 font-bold">Plateforme: +${(u.totalAdRevenueGenerated * 0.35).toFixed(4)}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  );
               })()}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#f0f2f5] min-h-screen -m-4 lg:-m-6 pb-24">
      <AnimatePresence>{renderSubContent()}</AnimatePresence>

      {/* Top Header */}
      <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">Mode payant</span>
          <HelpCircle size={16} className="text-gray-500" />
        </div>
        <button className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-xs font-bold transition-colors">
          Changer de mode
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between cursor-pointer active:bg-gray-50" onClick={() => setActiveTab('profile')}>
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                 {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <User size={24} className="text-gray-400" />}
              </div>
              <div>
                 <h4 className="font-bold text-sm">{user.displayName || "Utilisateur Quoto"}</h4>
                 <p className="text-xs text-gray-500">Voir votre profil</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-gray-100 bg-red-50 flex items-center justify-center text-red-500">D</div>
              <ChevronDown size={20} className="text-gray-400" />
           </div>
        </div>

        {/* Account Switch */}
        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex items-center justify-center text-xs text-white">QC</div>
              <p className="text-sm font-medium">Changer de compte</p>
           </div>
           <ChevronDown size={20} className="text-gray-400" />
        </div>

        {/* Invite Friends */}
        <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 active:bg-gray-50">
           <div className="text-red-400"><Heart fill="currentColor" size={24} /></div>
           <p className="text-sm font-bold flex-1">Inviter des ami(e)s</p>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-2 gap-3">
           {menuItems.map((item) => (
             <div 
               key={item.id} 
               onClick={() => item.tab && setActiveTab(item.tab as any)}
               className="bg-white p-3 rounded-xl shadow-sm space-y-1 active:bg-gray-50 cursor-pointer"
             >
                {item.icon}
                <p className="text-xs font-bold">{item.label}</p>
             </div>
           ))}
        </div>

        {/* Accordions */}
        <div className="space-y-4 pt-4">
           {/* Section 1 */}
           <div className="border-t border-gray-200">
             <button onClick={() => handleToggle('settings')} className="w-full py-4 flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-3">
                   <Settings size={22} className="text-gray-500" />
                   <span className="font-bold text-sm">Paramètres et confidentialité</span>
                </div>
                <ChevronDown className={cn("transition-transform", expandedSection === 'settings' ? "rotate-180" : "")} />
             </button>
             <AnimatePresence>
                {expandedSection === 'settings' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2 pb-4">
                     <SubMenuItem icon={<Lock />} title="Sécurité et mot de passe" onClick={() => setShowSubContent('security')} />
                     <SubMenuItem icon={<Eye />} title="Confidentialité" />
                     <SubMenuItem icon={<CreditCard />} title="Paiements AdMob" />
                     <SubMenuItem icon={<Smartphone />} title="Utilisation de données" />
                  </motion.div>
                )}
             </AnimatePresence>
           </div>

           {/* Section 2 */}
           <div className="border-t border-gray-200">
             <button onClick={() => handleToggle('help')} className="w-full py-4 flex items-center justify-between text-gray-700">
                <div className="flex items-center gap-3">
                   <HelpCircle size={22} className="text-gray-500" />
                   <span className="font-bold text-sm">Aide et assistance</span>
                </div>
                <ChevronDown className={cn("transition-transform", expandedSection === 'help' ? "rotate-180" : "")} />
             </button>
             <AnimatePresence>
                {expandedSection === 'help' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2 pb-4">
                     <SubMenuItem icon={<BookOpen />} title="Mode d'utilisation" onClick={() => setShowSubContent('how-to')} />
                     <SubMenuItem icon={<Info />} title="À propos de l'application" onClick={() => setShowSubContent('about')} />
                     <SubMenuItem icon={<Globe />} title="Langues" />
                  </motion.div>
                )}
             </AnimatePresence>
           </div>

           {/* Admin Console shortcut if isAdmin */}
           {isAdminEmail && (
             <div className="border-t border-gray-200">
                <button 
                  onClick={() => setShowSubContent('admin-console')}
                  className="w-full py-4 flex items-center justify-between text-orange-600 active:bg-orange-50 transition-colors"
                >
                   <div className="flex items-center gap-3">
                      <Settings size={22} />
                      <span className="font-bold text-sm">Console Administrateur (158f)</span>
                   </div>
                   <ChevronLeft className="rotate-180" />
                </button>
             </div>
           )}

           {/* Logout/Add Account */}
           <div className="space-y-4 pt-4 border-t border-gray-200">
              <button className="flex items-center gap-3 w-full p-2 hover:bg-white/50 rounded-lg">
                 <UserPlus size={22} className="text-gray-500" />
                 <span className="font-bold text-sm">Ajouter un compte</span>
              </button>
              <button onClick={onLogout} className="flex items-center gap-3 w-full p-2 hover:bg-white/50 rounded-lg text-red-500">
                 <LogOut size={22} />
                 <span className="font-bold text-sm">Déconnexion</span>
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function SubMenuItem({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-3 bg-white/50 hover:bg-white rounded-xl transition-all">
       <div className="text-gray-500">{React.cloneElement(icon as any, { size: 18 })}</div>
       <span className="text-sm font-medium">{title}</span>
    </button>
  );
}

function SecurityItem({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100">
       <div className="flex items-center gap-3">
          <div className="text-blue-500">{React.cloneElement(icon as any, { size: 20 })}</div>
          <span className="font-bold text-sm text-gray-800">{title}</span>
       </div>
       <ChevronLeft className="rotate-180 text-gray-400" />
    </div>
  );
}

function UsageStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
       <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">{num}</div>
       <div>
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function User({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ThresholdCard({ title, amount, icon, color }: { title: string, amount: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className={cn("p-4 rounded-xl border flex items-center justify-between shadow-sm", colorMap[color])}>
       <div className="flex items-center gap-3">
          {icon}
          <span className="font-bold text-sm">{title}</span>
       </div>
       <span className="text-lg font-black">{amount}</span>
    </div>
  );
}

function AdminModuleCard({ name, status, enabled, onEdit, onToggle }: { name: string, status: string, enabled: boolean, onEdit?: () => void, onToggle?: () => void }) {
  return (
    <div 
      className={cn(
        "bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2 cursor-pointer transition-all active:scale-95",
        onEdit ? "hover:border-blue-300" : ""
      )}
    >
       <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-gray-800 leading-tight" onClick={onEdit}>{name}</h4>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
            className={cn(
              "w-6 h-3.5 rounded-full relative transition-colors",
              enabled ? "bg-blue-500" : "bg-gray-200"
            )}
          >
            <div className={cn("absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all", enabled ? "right-0.5" : "left-0.5")} />
          </button>
       </div>
       <div onClick={onEdit}>
          <span className={cn(
            "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
            status === 'complete' ? "bg-green-50 text-green-600" : 
            status === 'stable' ? "bg-blue-50 text-blue-600" :
            status === 'partial' ? "bg-orange-50 text-orange-600" : 
            status === 'hidden' ? "bg-gray-100 text-gray-400" : "bg-purple-50 text-purple-600"
          )}>{status}</span>
       </div>
    </div>
  );
}

function AdminTab({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap", active ? "bg-white shadow-sm text-[#ff6b35]" : "text-gray-400")}>
      {icon} {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className="px-2 py-1 rounded-full text-[8px] font-bold uppercase bg-gray-100 text-gray-700">{status}</span>;
}

function ConfigToggle({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between p-4 rounded-[20px] border transition-all duration-300",
        active ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 border-white/10 text-white/60"
      )}
    >
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <div className={cn(
        "w-10 h-5 rounded-full relative transition-colors duration-300",
        active ? "bg-white/20" : "bg-white/10"
      )}>
        <motion.div 
          animate={{ x: active ? 20 : 2 }}
          initial={false}
          className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-md"
        />
      </div>
    </button>
  );
}

function IntegrationKeyInput({ label, value, onChange, isSecret = false }: { label: string, value: string, onChange: (val: string) => void, isSecret?: boolean }) {
   const [show, setShow] = useState(false);
   const [localVal, setLocalVal] = useState(value);

   useEffect(() => {
     setLocalVal(value);
   }, [value]);

   return (
     <div className="space-y-1.5">
        <label className="text-[9px] font-bold text-white/30 uppercase ml-1 tracking-widest">{label}</label>
        <div className="relative">
           <input 
              type={isSecret && !show ? "password" : "text"}
              value={localVal}
              onChange={(e) => setLocalVal(e.target.value)}
              onBlur={() => onChange(localVal)}
              placeholder={`Config ${label}...`}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none pr-10"
           />
           {isSecret && (
              <button 
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                 {show ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-50" />}
              </button>
           )}
        </div>
     </div>
   );
}
