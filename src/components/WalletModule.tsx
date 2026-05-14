import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Coins, CreditCard, Smartphone, Banknote, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

import { ShieldCheck, Cloud, Smartphone as SmartphoneIcon } from 'lucide-react';

import { getApiUrl } from '../lib/httpClient';

export function WalletModule({ user, userProfile }: { user: any, userProfile: UserProfile | null }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [method, setMethod] = useState<'local' | 'crypto' | 'bank'>('local');
  const [showConfirm, setShowConfirm] = useState(false);

  // Devises et Taux (Simplifiés pour le UI)
  const isEurope = userProfile?.region === 'Europe' || userProfile?.withdrawalMethod === 'Bank';
  const currencySymbol = isEurope ? '€' : '$';

  const handleTransaction = async () => {
    if (!amount || Number(amount) <= 0) return;
    setLoading(true);
    try {
      // Logique de frais ou de changement de taux si nécessaire
      const numAmount = Number(amount);
      
      if (transactionType === 'withdraw') {
        const threshold = userProfile?.region === 'Africa' ? 50 : isEurope ? 70 : 100;
        if (numAmount < threshold) {
          alert(`Le seuil minimum de retrait est de ${threshold}${currencySymbol}`);
          setLoading(false);
          return;
        }
        if ((userProfile?.balance || 0) < numAmount) {
          alert("Solde insuffisant.");
          setLoading(false);
          return;
        }
      }

      // Enregistrement de la transaction et appel API
      let apiResult: any = null;

      if (transactionType === 'deposit') {
        if (method === 'crypto') {
          const res = await fetch(getApiUrl('/api/finance/deposit/crypto'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: numAmount, currency: 'BTC', userId: user.uid }) // Par défaut BTC pour démo
          });
          apiResult = await res.json();
        } else if (method === 'local') {
          const res = await fetch(getApiUrl('/api/finance/deposit/local'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: numAmount, email: user.email, userId: user.uid, phoneNumber: userProfile?.phoneNumber })
          });
          apiResult = await res.json();
        }
      } else {
        const res = await fetch(getApiUrl('/api/finance/withdraw'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amount: numAmount, 
            method: method === 'local' ? 'flutterwave' : 'nowpayments', 
            userId: user.uid,
            bankDetails: { method, accountNumber: userProfile?.phoneNumber || 'N/A' }
          })
        });
        apiResult = await res.json();
      }

      // Enregistrement Firestore pour historique
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: numAmount,
        currency: isEurope ? 'EUR' : 'USD',
        method: method,
        type: transactionType,
        status: 'pending',
        externalId: apiResult?.payment_id || apiResult?.id || null,
        createdAt: serverTimestamp()
      });

      if (transactionType === 'deposit' && apiResult?.link) {
        window.open(apiResult.link, '_blank');
      } else if (transactionType === 'deposit' && apiResult?.invoice_url) {
        window.open(apiResult.invoice_url, '_blank');
      }

      alert("Requête de " + (transactionType === 'deposit' ? "dépôt" : "retrait") + " envoyée avec succès.");
      setAmount('');
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-32 px-4 max-w-xl mx-auto">
      <header className="py-6">
        <h2 className="text-4xl font-black font-display tracking-tight text-gray-900">Portefeuille</h2>
        <p className="text-gray-500 font-medium">Gérez vos fonds Quoto Connect. Retrait en {currencySymbol} et Dépôt sécurisé.</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full w-fit font-bold uppercase tracking-widest flex items-center gap-1">
             <ShieldCheck size={12} /> Région: {userProfile?.region || 'Inconnue'}
          </div>
          <div className="text-[10px] bg-green-50 text-green-600 px-3 py-1 rounded-full w-fit font-bold uppercase tracking-widest flex items-center gap-1">
             <Cloud size={12} /> Cloud Sync: Actif
          </div>
        </div>
      </header>

      {/* Card Balance */}
      <div className="bg-[#1a1a1a] p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Solde Total</p>
           <h3 className="text-5xl font-black font-display tracking-tighter">
             {userProfile?.balance?.toFixed(2) || "0.00"} {currencySymbol}
           </h3>
           <div className="flex items-center gap-2 text-green-400 text-sm mt-4">
             <Coins size={16} />
             <span className="font-bold">{userProfile?.coins || 0} Pièces (Éclats)</span>
           </div>
           
           <div className="mt-6 pt-4 border-t border-white/10 flex gap-6">
              <div>
                 <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Contenu</p>
                 <p className="text-sm font-black">{userProfile?.adRevenueCreator?.toFixed(4) || "0.0000"}{currencySymbol}</p>
              </div>
              <div>
                 <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Publicité</p>
                 <p className="text-sm font-black">{userProfile?.adRevenueRewarded?.toFixed(4) || "0.0000"}{currencySymbol}</p>
              </div>
           </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
        <Wallet className="absolute right-8 top-8 opacity-20 text-white" size={40} />
      </div>

      {/* Main Tabs */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
          <div className="flex bg-gray-50 p-1.5 rounded-2xl">
            <button 
              onClick={() => { setTransactionType('deposit'); setMethod('local'); }}
              className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", transactionType === 'deposit' ? "bg-white shadow-md text-blue-600" : "text-gray-400")}
            >
              <ArrowDownLeft size={18} /> Dépôt
            </button>
            <button 
              onClick={() => { setTransactionType('withdraw'); setMethod('crypto'); }}
              className={cn("flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2", transactionType === 'withdraw' ? "bg-white shadow-md text-orange-600" : "text-gray-400")}
            >
              <ArrowUpRight size={18} /> Retrait
            </button>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Méthode</label>
            <div className="grid grid-cols-3 gap-3">
               <MethodButton 
                 active={method === 'local'} 
                 onClick={() => setMethod('local')}
                 icon={<Smartphone size={20} />} 
                 label="Mobile" 
               />
               <MethodButton 
                 active={method === 'crypto'} 
                 onClick={() => setMethod('crypto')}
                 icon={<Banknote size={20} />} 
                 label="Crypto" 
               />
               <MethodButton 
                 active={method === 'bank'} 
                 onClick={() => setMethod('bank')}
                 icon={<CreditCard size={20} />} 
                 label="Banque" 
               />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase ml-2 tracking-widest">Montant en ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">{currencySymbol}</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-5 text-2xl font-black focus:ring-2 focus:ring-[#1877F2] outline-none"
              />
            </div>
          </div>

          <button 
            onClick={() => setShowConfirm(true)}
            disabled={!amount || loading}
            className={cn(
              "w-full py-5 rounded-[24px] font-black text-white text-lg shadow-xl transition-all active:scale-95 disabled:opacity-50",
              transactionType === 'deposit' ? "bg-blue-600 shadow-blue-500/20" : "bg-orange-600 shadow-orange-500/20"
            )}
          >
            {transactionType === 'deposit' ? 'Confirmer Dépôt' : 'Lancer le Retrait'}
          </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 z-[110] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 space-y-6 relative"
            >
              <button 
                onClick={() => setShowConfirm(false)}
                className="absolute right-6 top-6 p-2 bg-gray-100 rounded-full text-gray-500"
              ><X size={20} /></button>

              <div className="text-center space-y-2">
                <h4 className="text-2xl font-black text-gray-900 uppercase">Confirmation</h4>
                <p className="text-gray-500 font-medium">Voulez-vous {transactionType === 'deposit' ? 'déposer' : 'retirer'} {amount}{currencySymbol} via {method} ?</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                 <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>Frais de réseau</span>
                    <span className="text-gray-900">0.00 {currencySymbol}</span>
                 </div>
                 <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>{amount}{currencySymbol}</span>
                 </div>
              </div>

              <button 
                onClick={handleTransaction}
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Procéder"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MethodButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all",
        active ? "bg-blue-50 border-blue-500 text-blue-600 shadow-sm" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
      )}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );
}
