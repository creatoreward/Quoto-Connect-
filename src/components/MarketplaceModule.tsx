import React from 'react';
import { motion } from 'motion/react';
import { Store, Sparkles, ArrowRight } from 'lucide-react';

export function MarketplaceModule() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-32">
      <h2 className="editorial-title text-4xl">Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 flex flex-col justify-between shadow-sm">
          <Sparkles className="text-purple-500 mb-4" />
          <h3 className="font-bold">Pack Premium IA</h3>
          <p className="text-xs text-gray-400 mb-4">Citations HD par Gemini Pro.</p>
          <div className="flex items-center justify-between">
            <span className="font-editorial text-xl">9.99 $</span>
            <button className="bg-black text-white px-4 py-2 rounded-full text-[10px] font-bold">Acheter</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
