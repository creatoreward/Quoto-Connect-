import React from 'react';
import { motion } from 'motion/react';
import { Flag, Plus, Search, MoreHorizontal, MessageSquare, ThumbsUp } from 'lucide-react';
import { cn } from '../lib/utils';

export function PagesModule() {
  const pages = [
    { id: 1, name: "Quoto Connect - Official", followers: "450K", category: "Produit/Service", cover: "https://picsum.photos/seed/page1/600/200" },
    { id: 2, name: "IA Inspiration Daily", followers: "12K", category: "Communauté de créateurs", cover: "https://picsum.photos/seed/page2/600/200" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold">Pages</h2>
         <button className="bg-blue-50 hover:bg-blue-100 text-[#1877F2] px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
            <Plus size={18} /> Créer une Page
         </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
         <h3 className="font-bold text-[17px]">Pages que vous suivez</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {pages.map(page => (
             <div key={page.id} className="border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="h-24 overflow-hidden relative">
                   <img src={page.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-bold">VÉRIFIÉ</div>
                </div>
                <div className="p-3 space-y-2">
                   <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-[15px] line-clamp-1">{page.name}</h4>
                        <p className="text-[11px] text-gray-500 font-medium">{page.category} &bull; {page.followers} followers</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                         <Flag size={14} />
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="flex-1 bg-[#1877F2] text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                         <ThumbsUp size={14} /> J'aime
                      </button>
                      <button className="flex-1 bg-gray-100 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                         <MessageSquare size={14} /> Voir
                      </button>
                   </div>
                </div>
             </div>
           ))}
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center flex flex-col items-center justify-center space-y-4">
         <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#ff6b35]">
            <Flag size={40} />
         </div>
         <div className="space-y-1">
            <h3 className="text-xl font-bold">Créez votre propre Page</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">Promouvez votre marque de créateur Quoto et touchez des millions d'utilisateurs avec vos citations IA.</p>
         </div>
         <button className="bg-[#ff6b35] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-all">Lancer ma Page</button>
      </div>
    </motion.div>
  );
}
