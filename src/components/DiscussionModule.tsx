import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Edit, MoreHorizontal, Video, Phone, Info, Send, Image as ImageIcon, Smile, Mic } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { FeatureLock } from './FeatureLock';
import { adService } from '../services/adService';

export function DiscussionModule({ user, userProfile }: { user: any, userProfile: UserProfile | null }) {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [message, setMessage] = useState('');
  const [sentMessages, setSentMessages] = useState<string[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setSentMessages([...sentMessages, message]);
    setMessage('');
    adService.incrementAction();
  };

  const chats = [
    { id: 1, name: "Utilisateur Quoto", lastMsg: "Salut ! On commence le projet ?", time: "12:45", online: true },
    { id: 2, name: "Créateur Digital", lastMsg: "Tu as vu la nouvelle update ?", time: "Hier", online: true },
    { id: 3, name: "Support Quoto", lastMsg: "Votre retrait est prêt.", time: "Lun", online: false },
    { id: 4, name: "Group: AdMob Africa", lastMsg: "User: Est-ce que le CPM monte ?", time: "Dim", online: false },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)] -mx-4 lg:-mx-6 -my-4 flex bg-white overflow-hidden rounded-xl shadow-lg border border-gray-200">
      {/* Sidebar List */}
      <div className={cn("w-full lg:w-[360px] border-r border-gray-200 flex flex-col h-full bg-white", activeChat ? "hidden lg:flex" : "flex")}>
         <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold">Discussions</h2>
               <div className="flex gap-2">
                 <SidebarAction icon={<MoreHorizontal />} />
                 <SidebarAction icon={<Video />} />
                 <SidebarAction icon={<Edit />} />
               </div>
            </div>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Rechercher dans Messenger" 
                 className="w-full bg-[#f0f2f5] border-none rounded-full pl-10 pr-4 py-2 text-sm outline-none"
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                  activeChat === chat.id ? "bg-blue-50" : "hover:bg-gray-100"
                )}
              >
                 <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400">
                       {chat.name[0]}
                    </div>
                    {chat.online && <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <h4 className="font-bold text-[15px] truncate">{chat.name}</h4>
                       <span className="text-xs text-gray-400">{chat.time}</span>
                    </div>
                    <p className={cn("text-xs truncate", activeChat === chat.id ? "text-blue-500 font-bold" : "text-gray-500")}>
                      {chat.lastMsg} &bull; {chat.time}
                    </p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Chat Area */}
      <div className={cn("flex-1 flex flex-col bg-white h-full", activeChat ? "flex" : "hidden lg:flex")}>
         {activeChat ? (
           <>
             {/* Chat Header */}
             <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                   <button onClick={() => setActiveChat(null)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full text-blue-500">&larr;</button>
                   <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden text-gray-400 flex items-center justify-center font-bold">
                      {chats.find(c => c.id === activeChat)?.name[0]}
                   </div>
                   <div>
                      <h4 className="text-sm font-bold">{chats.find(c => c.id === activeChat)?.name}</h4>
                      <p className="text-[10px] text-green-500 font-bold">En ligne</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <ChatAction icon={<Phone />} />
                   <ChatAction icon={<Video />} />
                   <ChatAction icon={<Info />} />
                </div>
             </div>

             {/* Messages View */}
             <div className="flex-1 bg-white overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className="flex flex-col items-center py-6">
                   <div className="w-20 h-20 rounded-full bg-gray-100 mb-2 flex items-center justify-center text-2xl font-bold text-gray-400">
                     {chats.find(c => c.id === activeChat)?.name[0]}
                   </div>
                   <h3 className="font-bold text-lg">{chats.find(c => c.id === activeChat)?.name}</h3>
                   <p className="text-xs text-gray-500 italic">Vous êtes amis sur Quoto Connect</p>
                </div>

                <div className="flex justify-start">
                   <p className="bg-[#f0f2f5] text-gray-800 p-3 rounded-2xl rounded-bl-none max-w-[70%] text-[15px]">
                     {chats.find(c => c.id === activeChat)?.lastMsg}
                   </p>
                </div>
                
                <div className="flex justify-end">
                   <p className="bg-[#0084ff] text-white p-3 rounded-2xl rounded-br-none max-w-[70%] text-[15px]">
                     On peut commencer maintenant sur la partie Admin ?
                   </p>
                </div>

                {sentMessages.map((msg, idx) => (
                  <div key={idx} className="flex justify-end">
                     <p className="bg-[#0084ff] text-white p-3 rounded-2xl rounded-br-none max-w-[70%] text-[15px]">
                       {msg}
                     </p>
                  </div>
                ))}
             </div>

             {/* Input Area */}
             <div className="p-4 border-t border-gray-200 flex items-center gap-3">
                <ChatAction icon={<ImageIcon />} />
                <ChatAction icon={<Mic size={20} />} />
                <div className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 flex items-center">
                   <input 
                     value={message}
                     onChange={(e) => setMessage(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                     placeholder="Aa" 
                     className="bg-transparent border-none w-full text-sm outline-none px-1"
                   />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="text-blue-500 hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                >
                   <Send size={24} />
                </button>
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50">
              <MessageCircle size={80} className="text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Sélectionnez une discussion</h3>
              <p className="text-sm text-gray-300 italic">Restez connecté avec votre communauté Quoto.</p>
           </div>
         )}
      </div>
    </motion.div>
  );
}

function SidebarAction({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 bg-[#f0f2f5] hover:bg-gray-200 rounded-full transition-all text-gray-600">
       {React.cloneElement(icon as any, { size: 18 })}
    </button>
  );
}

function ChatAction({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="p-2 hover:bg-gray-100 rounded-full transition-all text-blue-500">
       {React.cloneElement(icon as any, { size: 20 })}
    </button>
  );
}

function MessageCircle({ size, className }: { size: number, className: string }) {
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
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
