import React from 'react';
import { motion } from 'motion/react';
import { Search, Compass, Users, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '../lib/utils';

export function GroupsModule() {
  const groups = [
    { id: 1, name: "Quoto Creators Africa", members: "12K", cover: "https://picsum.photos/seed/grp1/600/200" },
    { id: 2, name: "AdMob Mediation Tips", members: "8.5K", cover: "https://picsum.photos/seed/grp2/600/200" },
    { id: 3, name: "Gemini AI Developers", members: "3.2K", cover: "https://picsum.photos/seed/grp3/600/200" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold">Groupes</h2>
         <HeaderAction icon={<Plus />} label="Créer un groupe" />
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
         <FilterTab label="Vos groupes" active />
         <FilterTab label="Découvrir" />
         <FilterTab label="Invitations" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold text-[17px]">Groupes que vous gérez</h3>
            <button className="text-blue-500 text-sm font-medium hover:bg-gray-100 px-3 py-1.5 rounded-lg">Voir tout</button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {groups.map(group => (
             <div key={group.id} className="border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="h-24 overflow-hidden">
                   <img src={group.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 space-y-1">
                   <h4 className="font-bold text-[15px] line-clamp-1">{group.name}</h4>
                   <p className="text-xs text-gray-400 font-medium">Dernière activité il y a 2h • {group.members} membres</p>
                   <button className="w-full mt-2 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold transition-colors">Voir le groupe</button>
                </div>
             </div>
           ))}
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
         <div className="flex items-center justify-between">
            <h3 className="font-bold text-[17px]">Activités récentes</h3>
            <MoreHorizontal className="text-gray-500" />
         </div>
         <p className="text-sm text-gray-500 italic">Aucune nouvelle publication dans vos groupes.</p>
      </div>
    </motion.div>
  );
}

function HeaderAction({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="bg-blue-50 hover:bg-blue-100 text-[#1877F2] px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2">
       {icon}
       {label}
    </button>
  );
}

function FilterTab({ label, active }: { label: string, active?: boolean }) {
  return (
    <button className={cn(
      "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
      active ? "bg-blue-50 text-[#1877F2]" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
    )}>
      {label}
    </button>
  );
}
