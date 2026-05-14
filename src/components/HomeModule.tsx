import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Smile, 
  MoreHorizontal, 
  X,
  Heart,
  MessageCircle,
  Share2,
  Quote as QuoteIcon,
  Search,
  Globe,
  Users,
  Eye,
  Zap
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { useInView } from 'react-intersection-observer';
import { FeatureLock } from './FeatureLock';
import { adService } from '../services/adService';
import { generateQuote } from '../lib/gemini';
import { cn } from '../lib/utils';
import { Quote, SocialPost, UserProfile } from '../types';

export function HomeModule({ user, quotes, posts, userProfile }: { user: any, quotes: Quote[], posts: SocialPost[], userProfile: UserProfile | null }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFeed, setActiveFeed] = useState<'quotes' | 'social'>('social');

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const gQuote = await generateQuote(topic);
      await addDoc(collection(db, 'quotes'), {
        ...gQuote,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        viewsCount: 0,
        likesCount: 0
      });
      setTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stories = [
    { id: 1, name: "Créer une story", isAdd: true },
    { id: 2, name: "Utilisateur Quoto", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=300&fit=crop" },
    { id: 3, name: "Créateur Digital", image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=200&h=300&fit=crop" },
    { id: 4, name: "Influenceur Quoto", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=300&fit=crop" },
    { id: 5, name: "Membre Actif", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=300&fit=crop" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-20">
      {/* Stories Rail */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
        {stories.map((story) => (
          <div key={story.id} className="relative min-w-[106px] h-[188px] rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm flex-shrink-0 cursor-pointer group">
            {story.isAdd ? (
              <div className="h-full flex flex-col">
                <div className="h-[70%] bg-gray-100 overflow-hidden">
                  {userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="relative h-[30%] flex items-center justify-center bg-white">
                   <div className="absolute -top-4 w-9 h-9 bg-[#1877F2] rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-sm ring-1 ring-gray-100">
                      <Plus size={22} strokeWidth={3} />
                   </div>
                   <span className="text-[12px] font-bold text-gray-900 mt-4 px-1 leading-tight text-center">Créer story</span>
                </div>
              </div>
            ) : (
              <>
                <img src={story.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute top-2 left-2 w-10 h-10 rounded-full border-[3px] border-[#1877F2] overflow-hidden p-[2px] bg-white ring-1 ring-black/5 shadow-md">
                   <img src={story.image} className="w-full h-full rounded-full object-cover" alt="" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
                <span className="absolute bottom-2.5 left-2 right-2 text-white text-[12px] font-bold leading-tight line-clamp-2 drop-shadow-md">{story.name}</span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Status Creation Bar */}
      <div className="bg-white rounded-xl shadow-sm p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
             {userProfile?.photoURL ? <img src={userProfile.photoURL} className="w-full h-full object-cover" /> : null}
          </div>
          <button 
            className="flex-1 bg-[#f0f2f5] hover:bg-gray-200 text-gray-500 rounded-full px-4 py-2 text-left text-[15px] transition-colors"
            onClick={() => setActiveFeed(activeFeed === 'quotes' ? 'social' : 'quotes')}
          >
            À quoi pensez-vous ?
          </button>
          <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer text-green-500">
             <ImageIcon size={24} />
          </div>
        </div>
        <div className="flex border-t border-gray-100 pt-1">
           <StatusActionButton icon={<Video className="text-red-500" />} label="Vidéo en direct" />
           <StatusActionButton icon={<ImageIcon className="text-green-500" />} label="Photo/vidéo" />
           <StatusActionButton icon={<Smile className="text-yellow-500" />} label="Humeur/activité" />
        </div>
      </div>

      {/* Inspiration vs Social Switch */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
         <button 
           onClick={() => setActiveFeed('social')}
           className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", activeFeed === 'social' ? "bg-gray-100 text-[#1877F2]" : "text-gray-500")}
         >
           Fil d'actualité
         </button>
         <button 
           onClick={() => setActiveFeed('quotes')}
           className={cn("flex-1 py-1.5 rounded-lg text-xs font-bold transition-all", activeFeed === 'quotes' ? "bg-orange-50 text-[#ff6b35]" : "text-gray-500")}
         >
           Intelligence Inspi (AI)
         </button>
      </div>

      {activeFeed === 'quotes' && (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
           <div className="flex gap-2">
             <input 
               value={topic}
               onChange={(e) => setTopic(e.target.value)}
               placeholder="Qu'est-ce qui vous inspire aujourd'hui ?"
               className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-0"
             />
             <button 
               onClick={handleGenerate}
               disabled={loading || !topic}
               className="bg-[#ff6b35] text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50"
             >
               {loading ? "..." : "Générer"}
             </button>
           </div>
        </div>
      )}

      {/* Content Feed */}
      <div className="space-y-4">
        {activeFeed === 'quotes' ? (
          quotes.map((q) => (
            <FacebookPost 
              key={q.id} 
              id={q.id}
              user={user}
              userProfile={userProfile}
              creatorId={q.creatorId}
              collectionName="quotes"
              author={q.author} 
              time="Sponsorisé par Q.Connect"
              content={"\" " + q.text + " \""}
              category={q.category}
              views={q.viewsCount}
              isQuote
            />
          ))
        ) : (
          posts.map(post => (
            <FacebookPost 
              key={post.id} 
              id={post.id}
              user={user}
              userProfile={userProfile}
              creatorId={post.userId}
              collectionName="posts"
              author="Utilisateur Quoto" 
              time="Hier, 23h"
              content={post.content}
              likes={post.likesCount}
              comments={post.commentsCount}
              views={post.viewsCount}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

function StatusActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
       {icon}
       <span className="text-xs font-semibold text-gray-600 hidden sm:inline">{label}</span>
    </button>
  );
}

function FacebookPost({ id, collectionName, author, time, content, likes = 0, comments = 0, views = 0, category, isQuote, user, userProfile, creatorId }: { id?: string, collectionName?: string, author: string, time: string, content: string, likes?: number, comments?: number, views?: number, category?: string, isQuote?: boolean, user: any, userProfile: UserProfile | null, creatorId?: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5
  });

  React.useEffect(() => {
    if (inView && id && collectionName) {
      const postRef = doc(db, collectionName, id);
      updateDoc(postRef, {
        viewsCount: increment(1)
      }).catch(err => console.error("Error updating views:", err));

      // Track revenue for the creator
      if (creatorId) {
        adService.trackContentAdView(creatorId);
      }
    }
  }, [inView, id, collectionName, creatorId]);

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-gray-400">
             {isQuote ? <QuoteIcon size={20} className="text-[#ff6b35]" /> : <Users size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-1">
               <h4 className="font-bold text-[14px] text-gray-900 leading-tight hover:underline cursor-pointer font-sans">{author}</h4>
               {isQuote && <span className="text-[#1877F2] font-bold text-[11px]">• Suivre</span>}
            </div>
            <p className="text-[12px] text-gray-500 font-medium leading-none mt-0.5">{time} • <Globe size={10} className="inline mb-0.5" /></p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><MoreHorizontal size={20} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"><X size={20} /></button>
        </div>
      </div>

      <div className="px-3 pb-2 pt-1">
        <p className={cn("text-[15px] text-gray-800 leading-[1.3] font-sans", isQuote ? "font-serif text-[18px] italic border-l-4 border-orange-200 pl-3 py-2 text-gray-900" : "")}>{content}</p>
        <p className="text-[#1877F2] text-[13px] mt-2 font-semibold cursor-pointer hover:underline">#QuotoConnect #Inspiration {category && `#${category}`}</p>
      </div>

      {isQuote && (
        <div className="bg-gray-100 border-y border-gray-200 aspect-video relative flex items-center justify-center overflow-hidden">
           <img src={`https://picsum.photos/seed/${author}/600/400`} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-8 text-center text-white backdrop-blur-[2px]">
              <p className="font-serif text-2xl drop-shadow-lg">{content}</p>
           </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
           <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px]"><Heart size={8} fill="white" /></div>
              <span className="text-xs text-gray-500 ml-1">{likes}</span>
           </div>
           <div className="text-xs text-gray-500">
              <span>{views >= 1000 ? (views / 1000).toFixed(1) + 'k' : views} vues • {comments} commentaires</span>
           </div>
        </div>
        
        <div className="flex pt-1">
           <PostActionButton icon={<Heart size={20} />} label="J'aime" />
           <PostActionButton icon={<MessageCircle size={20} />} label="Commenter" />
           <PostActionButton icon={<Share2 size={20} />} label="Partager" />
           <div className="flex-1">
              <FeatureLock 
                userId={user?.uid} 
                videosWatched={userProfile?.videosWatchedTotal || 0} 
                requiredVideos={adService.REWARDS.VIEW_BOOST} 
                featureName="Boost 100 Vues" 
                onUnlock={async () => {
                  if (id && collectionName) {
                    await updateDoc(doc(db, collectionName, id), {
                      viewsCount: increment(100)
                    });
                    alert("Boost activé ! +100 vues");
                  }
                }}
              >
                <PostActionButton icon={<Zap size={20} className="text-orange-500" />} label="Boost" />
              </FeatureLock>
           </div>
        </div>
      </div>
    </div>
  );
}

function PostActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
       <span className="text-gray-500 group-hover:scale-110 transition-transform">{icon}</span>
       <span className="text-sm font-semibold text-gray-600 hidden md:inline">{label}</span>
    </button>
  );
}
