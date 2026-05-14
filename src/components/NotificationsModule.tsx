import React from 'react';
import { motion } from 'motion/react';
import { Heart, UserPlus, Info } from 'lucide-react';

export function NotificationsModule() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
       <h2 className="editorial-title text-4xl">Notifications</h2>
       <div className="space-y-4">
         <div className="bg-white p-6 rounded-3xl border border-gray-100 flex gap-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center"><Heart size={18} /></div>
            <div>
              <p className="font-bold text-sm">Nouveau Like</p>
              <p className="text-xs text-gray-400">@quoto_user a aimé votre post.</p>
            </div>
         </div>
       </div>
    </motion.div>
  );
}
