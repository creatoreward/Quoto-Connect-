import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, DollarSign, Users, ShieldCheck, X, ArrowRight, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function WelcomeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-[#1877F2] to-[#1155cc] p-8 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <Sparkles className="w-12 h-12 mb-4 opacity-80" />
              <h2 className="text-3xl font-black mb-2">Bienvenue sur Quoto Connect !</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Vous venez de rejoindre la première plateforme sociale où votre inspiration se transforme en revenus réels.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <FeatureItem 
                  icon={<Zap className="text-orange-500" />}
                  title="Inspiration IA illimitée"
                  desc="Utilisez Gemini AI pour générer des citations captivantes en un clic."
                />
                <FeatureItem 
                  icon={<DollarSign className="text-green-500" />}
                  title="Monétisation Directe"
                  desc="Gagnez de l'argent chaque fois que vos Reels ou publications sont vus."
                />
                <FeatureItem 
                  icon={<Users className="text-blue-500" />}
                  title="Communauté Engagée"
                  desc="Partagez vos créations sur TikTok et Facebook directement depuis l'app."
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={onClose}
                  className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10"
                >
                  C'est parti ! <ArrowRight size={18} />
                </button>
              </div>
              
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Identifiant Public : {window.location.hostname}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-500 leading-tight">{desc}</p>
      </div>
    </div>
  );
}
