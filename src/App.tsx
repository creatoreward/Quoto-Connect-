/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError } from './lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Play, 
  Store, 
  Wallet, 
  Bell, 
  User as UserIcon, 
  Menu as MenuIcon,
  LogIn,
  UserPlus,
  Mail,
  Smartphone as SmartphoneIcon,
  ChevronRight,
  ArrowRight,
  Lock,
  Shield,
  Users,
  MessageCircle,
  Search,
  Plus as PlusIcon,
  Video,
  Trophy,
  Settings,
  Gift,
  Calendar
} from 'lucide-react';

// Modular Components
import { HomeModule } from './components/HomeModule';
import { VideoModule } from './components/VideoModule';
import { MarketplaceModule } from './components/MarketplaceModule';
import { WalletModule } from './components/WalletModule';
import { NotificationsModule } from './components/NotificationsModule';
import { ProfileModule } from './components/ProfileModule';
import { MenuModule } from './components/MenuModule';
import { GroupsModule } from './components/GroupsModule';
import { DiscussionModule } from './components/DiscussionModule';
import { PagesModule } from './components/PagesModule';
import { FriendsModule } from './components/FriendsModule';
import { ChallengesModule } from './components/ChallengesModule';
import { CreatorDashboard } from './components/CreatorDashboard';
import { WelcomeModal } from './components/WelcomeModal';

import { adService } from './services/adService';
import { configService } from './services/configService';
import { socialAutomation } from './services/socialAutomationService';
import { cn } from './lib/utils';
import type { Quote, SocialPost, UserProfile, RemoteConfig } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [remoteConfig, setRemoteConfig] = useState<RemoteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'guest'>('login');
  const [region, setRegion] = useState<'Africa' | 'Europe' | 'Other'>('Africa');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Custom Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [activeTab, setActiveTab] = useState<'home' | 'video' | 'marketplace' | 'wallet' | 'notifications' | 'profile' | 'menu' | 'groups' | 'discussion' | 'pages' | 'friends' | 'challenges' | 'birthdays' | 'events' | 'creator'>('home');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);

  const isModuleEnabled = (id: string, defaultVal = true) => {
    if (!remoteConfig?.modules) return defaultVal;
    return remoteConfig.modules[id]?.enabled !== false;
  };

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + (Math.random() * 10);
          return next > 95 ? 95 : next;
        });
      }, 300);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      // Init Remote Config
      configService.initConfig().then(() => {
        configService.subscribe(setRemoteConfig);
      });
      
      // Complete progress and then close splash
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          // Point 1: Welcome message
          if (u) setShowWelcome(true);
        }, 400);
      }, 500);

      // Point 2: Seed content if empty (Admin only for permissions)
      const admins = ['developpeurhacker01@gmail.com', 'ngoyelie866@gmail.com'];
      if (u && admins.includes(u.email || '')) {
        socialAutomation.seedDailyContent(u.uid);
      }

      if (u) {
        // Silently ensure profile exists without blocking main loading
        const userRef = doc(db, 'users', u.uid);
        getDoc(userRef)
          .then(async (snap) => {
            if (!snap.exists()) {
              const isAdmin = u.email === 'developpeurhacker01@gmail.com' || u.email === 'ngoyelie866@gmail.com';
              await setDoc(userRef, {
                uid: u.uid,
                displayName: u.displayName || 'Creator',
                email: u.email || '',
                phoneNumber: phone || '',
                region: region,
                withdrawalMethod: region === 'Africa' ? 'MobileMoney' : region === 'Europe' ? 'Bank' : 'Crypto',
                balance: 0,
                coins: 0,
                followersCount: 0,
                followingCount: 0,
                createdAt: serverTimestamp(),
                role: isAdmin ? 'admin' : 'user',
                isVerified: isAdmin
              }).catch(err => handleFirestoreError(err, 'create', `users/${u.uid}`));
            }
          })
          .catch(err => handleFirestoreError(err, 'get', `users/${u.uid}`));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user && authMode !== 'guest') return;
    
    // Point 3: Inject custom scripts from remote config
    if (remoteConfig?.customScripts) {
      try {
        const scriptId = 'quoto-custom-script';
        const existingScript = document.getElementById(scriptId);
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = scriptId;
        script.textContent = remoteConfig.customScripts;
        document.head.appendChild(script);
      } catch (err) {
        console.error("Error with custom scripts:", err);
      }
    }

    // Quotes Stream
    const qQuotes = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quote)));
    });

    // Posts Stream
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost)));
    });

    // Profile Real-time Sync
    let unsubProfile = () => {};
    if (user) {
      unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) setUserProfile(doc.data() as UserProfile);
      });
    }

    return () => {
      unsubQuotes();
      unsubPosts();
      unsubProfile();
    };
  }, [user]);

  const handleAction = () => {
    adService.incrementAction();
  };

  const handleLogin = async (type: 'google' | 'email' = 'google') => {
    if (loginLoading) return;
    setLoginLoading(true);

    const admins = ['developpeurhacker01@gmail.com', 'ngoyelie866@gmail.com'];
    const isAdmin = admins.includes(email);
    const isDevPass = password === 'QC2026';

    try {
      if (type === 'google') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } else {
        if (authMode === 'register') {
          // Custom Registration
          const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
        } else {
          // Custom Login
          const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
          
          if (isAdmin && isDevPass) {
            // Special bypass for admin account creation/access
            try {
              await signInWithEmailAndPassword(auth, email, password);
            } catch (loginErr: any) {
              if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
                const res = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(res.user, { displayName: `Admin (${email.split('@')[0]})` });
              } else {
                throw loginErr;
              }
            }
          } else {
            await signInWithEmailAndPassword(auth, email, password);
          }
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        console.warn("Connexion annulée.");
      } else if (err.code === 'auth/email-already-in-use') {
        alert("Cet email est déjà utilisé. Essayez de vous connecter.");
      } else {
        console.error("Erreur d'authentification:", err);
        alert(err.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleDeveloperLogin = async () => {
    const admins = ['developpeurhacker01@gmail.com', 'ngoyelie866@gmail.com'];
    const targetEmail = admins.includes(email) ? email : 'developpeurhacker01@gmail.com';
    
    setLoginLoading(true);
    const devPassword = 'QC2026';
    
    try {
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      try {
        await signInWithEmailAndPassword(auth, targetEmail, devPassword);
      } catch (loginErr: any) {
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-credential') {
          const res = await createUserWithEmailAndPassword(auth, targetEmail, devPassword);
          await updateProfile(res.user, { displayName: `Admin ${targetEmail.split('@')[0]}` });
        } else {
          throw loginErr;
        }
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur accès dev: " + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center w-full max-w-[280px]"
        >
          <div className="w-24 h-24 bg-[#1877F2] rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-8 overflow-hidden">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-6xl font-black font-display"
            >
              Q
            </motion.h1>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-1 font-display">
              Quoto Connect
            </h2>
            <p className="text-[10px] font-bold text-gray-400 tracking-wider mb-6">quotoconnect.app</p>
            
            {/* Progress Bar Container */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <motion.div 
                className="h-full bg-[#1877F2]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              />
            </div>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Initialisation du système...</p>
          </motion.div>
          
          <div className="absolute bottom-12 flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">Propulsé par</span>
            <span className="text-sm font-black text-gray-400 tracking-tighter">CREATOR REWARD</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Maintenance Screen
  if (remoteConfig?.maintenanceMode && user?.email !== 'developpeurhacker01@gmail.com' && user?.email !== 'ngoyelie866@gmail.com') {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center p-8 z-[200]">
        <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
          <Settings size={40} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 text-center">Maintenance en cours</h2>
        <p className="text-gray-400 text-center text-sm max-w-xs">
          Quoto Connect se met à jour pour vous offrir de meilleures fonctionnalités. 
          Revenez dans quelques instants !
        </p>
        <div className="mt-12 flex flex-col items-center gap-2">
           <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">Version</span>
           <span className="text-sm font-black text-gray-500">{remoteConfig.appVersion}</span>
        </div>
      </div>
    );
  }

  if (!user && authMode !== 'guest') {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg space-y-12">
          <header className="text-center space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="editorial-title text-8xl text-[#ff6b35]"
            >
              QC
            </motion.div>
            <h1 className="editorial-title text-5xl lg:text-6xl tracking-tight">Quoto Connect</h1>
            <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">quotoconnect.app</p>
            <p className="text-gray-400 font-sans text-lg italic">L'intelligence au service de l'inspiration.</p>
          </header>

          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-2xl shadow-black/[0.03] space-y-8">
            <div className="flex bg-gray-50 p-1.5 rounded-2xl">
              <button 
                onClick={() => setAuthMode('login')}
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", authMode === 'login' ? "bg-white shadow-sm text-[#ff6b35]" : "text-gray-400")}
              >
                Connexion
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all", authMode === 'register' ? "bg-white shadow-sm text-[#ff6b35]" : "text-gray-400")}
              >
                Créer un compte
              </button>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin('email'); }}>
              {authMode === 'register' && (
                 <div className="space-y-4">
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="text" 
                      placeholder="Nom complet" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all"
                    />
                  </div>
                  <div className="relative">
                    <SmartphoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="tel" 
                      placeholder="Numéro de téléphone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Région</label>
                      <select 
                        value={region}
                        onChange={(e: any) => setRegion(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#ff6b35] outline-none"
                      >
                        <option value="Africa">Afrique</option>
                        <option value="Europe">Europe</option>
                        <option value="Other">Amérique / Autre</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Devise</label>
                      <select 
                        value={currency}
                        onChange={(e: any) => setCurrency(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#ff6b35] outline-none"
                      >
                        <option value="USD">Dollar ($)</option>
                        <option value="EUR">Euro (€)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-[#ff6b35] transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#1a1a1a] text-white py-5 rounded-3xl font-bold hover:bg-black transition-all shadow-xl shadow-black/5 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loginLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                  <>
                    {authMode === 'register' ? 'Rejoindre Quoto Connect' : 'Accéder à mon compte'}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] uppercase font-bold text-gray-300 tracking-[0.2em]">Ou continuer avec</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => handleLogin('google')}
                className="flex items-center justify-center gap-3 bg-white border border-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Google
              </button>
              <button 
                onClick={() => setAuthMode('guest')}
                className="flex items-center justify-center gap-3 bg-white border border-gray-100 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
              >
                Invitée
              </button>
            </div>

            <button 
              onClick={handleDeveloperLogin}
              className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline"
            >
              <Shield size={14} /> Accès Développeur (Direct)
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 px-12 leading-relaxed">
            En utilisant Quoto Connect, vous acceptez nos <span className="text-[#ff6b35] font-bold">Conditions Générales</span> et notre <span className="text-[#ff6b35] font-bold">Politique de Confidentialité</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f5] text-[#1a1a1a]">
      {/* Top Header - Facebook Style */}
      <header className="fixed top-0 left-0 w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-[100] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-black text-[#1877F2] tracking-tighter font-display">quoto</span>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher sur Quoto" 
              className="bg-[#f0f2f5] border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-0 font-sans"
            />
          </div>
        </div>

        {/* Desktop Header Nav */}
        <div className="hidden lg:flex items-center h-full">
           <TopNavButton icon={<Home size={26} />} active={activeTab === 'home'} onClick={() => { setActiveTab('home'); handleAction(); }} />
           {isModuleEnabled('social') && <TopNavButton icon={<Users size={26} />} active={activeTab === 'groups'} onClick={() => { setActiveTab('groups'); handleAction(); }} />}
           {isModuleEnabled('video') && <TopNavButton icon={<Video size={26} />} active={activeTab === 'video'} onClick={() => { setActiveTab('video'); handleAction(); }} />}
           <TopNavButton icon={<PlusIcon size={26} />} active={activeTab === 'creator'} onClick={() => { setActiveTab('creator'); handleAction(); }} />
           {isModuleEnabled('marketplace') && <TopNavButton icon={<Store size={26} />} active={activeTab === 'marketplace'} onClick={() => { setActiveTab('marketplace'); handleAction(); }} />}
           <TopNavButton icon={<MenuIcon size={26} />} active={activeTab === 'menu'} onClick={() => { setActiveTab('menu'); handleAction(); }} />
        </div>

        <div className="flex items-center gap-2">
          <HeaderCircularButton icon={<PlusIcon size={22} />} />
          <HeaderCircularButton icon={<Search size={22} />} className="lg:hidden" />
          <HeaderCircularButton icon={<Bell size={22} />} onClick={() => setActiveTab('notifications')} active={activeTab === 'notifications'} />
          <button 
            onClick={() => setActiveTab('profile')}
            className="w-10 h-10 rounded-full border-2 border-gray-100 overflow-hidden ml-1 hover:opacity-80 transition-opacity"
          >
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                <UserIcon size={18} />
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Tab Nav (Bottom) */}
      <nav className="fixed bottom-0 left-0 w-full h-14 bg-white border-t border-gray-200 lg:hidden grid grid-cols-6 items-center z-[100] px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <MobileNavButton icon={<Home size={24} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        {isModuleEnabled('social') && <MobileNavButton icon={<Users size={24} />} active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} />}
        <MobileNavButton icon={<PlusIcon size={24} />} active={activeTab === 'creator'} onClick={() => setActiveTab('creator')} />
        {isModuleEnabled('video') && <MobileNavButton icon={<Video size={24} />} active={activeTab === 'video'} onClick={() => setActiveTab('video')} />}
        <MobileNavButton icon={<Bell size={24} />} active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
        <MobileNavButton icon={<MenuIcon size={24} />} active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
      </nav>

      {/* Welcome Modal */}
      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />

      {/* Main Content Area */}
      <main className="pt-14 pb-14 lg:pb-0">
        <div className="max-w-7xl mx-auto flex justify-center lg:px-4">
          {/* Left Sidebar (Hidden on mobile) */}
          <aside className="hidden xl:block w-[300px] sticky top-14 h-[calc(100vh-56px)] py-4 pr-12">
            <SidebarItem icon={<Home className="text-[#1877F2]" />} label="Fil d'actualité" onClick={() => setActiveTab('home')} />
            <SidebarItem icon={<UserIcon className="text-blue-500" />} label={userProfile?.displayName || "Profil"} onClick={() => setActiveTab('profile')} />
            {isModuleEnabled('social') && <SidebarItem icon={<Users className="text-blue-400" />} label="Amis" onClick={() => setActiveTab('friends')} />}
            {isModuleEnabled('admob') && <SidebarItem icon={<Trophy className="text-yellow-500" />} label="Défis & Gains" onClick={() => setActiveTab('challenges')} />}
            {isModuleEnabled('social') && <SidebarItem icon={<MessageCircle className="text-green-500" />} label="Messenger" onClick={() => setActiveTab('discussion')} />}
            {isModuleEnabled('social') && <SidebarItem icon={<Users className="text-indigo-500" />} label="Groupes" onClick={() => setActiveTab('groups')} />}
            {isModuleEnabled('marketplace') && <SidebarItem icon={<Store className="text-blue-600" />} label="Marketplace" onClick={() => setActiveTab('marketplace')} />}
            <SidebarItem icon={<PlusIcon className="text-pink-500" />} label="Studio Créateur" onClick={() => setActiveTab('creator')} />
            {isModuleEnabled('video') && <SidebarItem icon={<Video className="text-red-500" />} label="Watch" onClick={() => setActiveTab('video')} />}
            {isModuleEnabled('admob') && <SidebarItem icon={<Wallet className="text-amber-500" />} label="Portefeuille" onClick={() => setActiveTab('wallet')} />}
            <SidebarItem icon={
              <div className="relative">
                <SmartphoneIcon className="text-gray-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
              </div>
            } label="Mobile : Configuré" />
            <SidebarItem icon={<span className="text-orange-500 font-bold">P</span>} label="Pages" onClick={() => setActiveTab('pages')} />
          </aside>

          {/* Feed / Page Content */}
          <div className="flex-1 max-w-[680px] py-4">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && <HomeModule user={user} quotes={quotes} posts={posts} userProfile={userProfile} />}
              {activeTab === 'video' && <VideoModule />}
              {activeTab === 'marketplace' && <MarketplaceModule />}
              {activeTab === 'wallet' && <WalletModule user={user} userProfile={userProfile} />}
              {activeTab === 'notifications' && <NotificationsModule />}
              {activeTab === 'profile' && <ProfileModule user={user} userProfile={userProfile} setActiveTab={setActiveTab} />}
              {activeTab === 'friends' && <FriendsModule user={user} userProfile={userProfile} />}
              {activeTab === 'challenges' && <ChallengesModule user={user} userProfile={userProfile} />}
              {activeTab === 'creator' && <CreatorDashboard />}
              {activeTab === 'menu' && <MenuModule user={user} quotes={quotes} onLogout={handleLogout} setActiveTab={setActiveTab} />}
              {activeTab === 'groups' && <GroupsModule />}
              {activeTab === 'discussion' && <DiscussionModule user={user} userProfile={userProfile} />}
              {activeTab === 'pages' && <PagesModule />}
              {activeTab === 'birthdays' && (
                <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center">
                  <Gift className="mx-auto text-pink-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold">Anniversaires</h3>
                  <p className="text-gray-500">Aucun anniversaire aujourd'hui parmi vos contacts.</p>
                </div>
              )}
              {activeTab === 'events' && (
                <div className="p-8 bg-white rounded-3xl border border-gray-100 text-center">
                  <Calendar size={48} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-xl font-bold">Évènements</h3>
                  <p className="text-gray-500">Prévoyez vos prochaines rencontres Quoto ici.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar (Hidden on mobile/tablet) */}
          <aside className="hidden lg:block w-[300px] sticky top-14 h-[calc(100vh-56px)] py-4 pl-4 overflow-y-auto">
             <div className="space-y-4">
                <h3 className="text-gray-500 font-bold text-sm">Publicité</h3>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] uppercase font-bold text-[#ff6b35]">AdMob Mediation</p>
                     <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded">Live</span>
                   </div>
                   <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center text-center p-3">
                      <p className="text-xs text-gray-400 italic">"Votre citation ici"</p>
                      <button className="mt-2 text-[10px] text-blue-500 font-bold">Sponsorisé</button>
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-gray-500 font-bold text-sm mb-4">Contacts</h3>
                  <div className="space-y-4">
                    <ContactItem name="Support Technique" status="En ligne" />
                    <ContactItem name="Assistance Commerciale" status="Hors ligne" />
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function TopNavButton({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center h-full px-12 group transition-all",
        active ? "text-[#1877F2]" : "text-gray-500 hover:bg-gray-100/50"
      )}
    >
      {icon}
      {active && (
        <motion.div 
          layoutId="header-active-bar"
          className="absolute bottom-0 left-0 w-full h-[3px] bg-[#1877F2]" 
        />
      )}
    </button>
  );
}

function HeaderCircularButton({ icon, onClick, active, className }: { icon: React.ReactNode, onClick?: () => void, active?: boolean, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
        active ? "bg-blue-50 text-[#1877F2]" : "bg-[#f0f2f5] hover:bg-gray-200 text-[#050505]",
        className
      )}
    >
      {icon}
    </button>
  );
}

function MobileNavButton({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center flex-1 h-full transition-colors",
        active ? "text-[#1877F2]" : "text-gray-500"
      )}
    >
      {icon}
      {active && <motion.div layoutId="nav-line" className="absolute bottom-0 left-1/4 w-1/2 h-[3px] bg-[#1877F2] rounded-t-full" />}
    </button>
  );
}

function SidebarItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-200/50 transition-all text-left group"
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl overflow-hidden">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </button>
  );
}

function ContactItem({ name, status }: { name: string, status: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200/50 cursor-pointer group">
      <div className="relative">
        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
          <UserIcon size={20} />
        </div>
        <div className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
          status === 'En ligne' ? 'bg-green-500' : 'bg-gray-300'
        )} />
      </div>
      <span className="text-sm font-medium text-gray-800">{name}</span>
    </div>
  );
}
