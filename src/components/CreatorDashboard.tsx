import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Type, 
  Palette, 
  Layers, 
  Download, 
  Share2, 
  Sparkles, 
  RotateCcw,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  ImageIcon,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { generateThemedQuote } from '../services/aiService';
import { cn } from '../lib/utils';

interface Template {
  id: string;
  name: string;
  bgGradient?: string;
  fontFamily: string;
  textColor: string;
  fontSize: string;
  filter: string;
  alignment: 'left' | 'center' | 'right';
}

const TEMPLATES: Template[] = [
  {
    id: 'minimal',
    name: 'Minimaliste',
    bgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: 'font-sans',
    textColor: '#1a1a1a',
    fontSize: 'text-3xl',
    filter: 'none',
    alignment: 'center'
  },
  {
    id: 'classic',
    name: 'Classique Édito',
    bgGradient: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    fontFamily: 'font-editorial',
    textColor: '#2c3e50',
    fontSize: 'text-4xl',
    filter: 'sepia(0.3)',
    alignment: 'center'
  },
  {
    id: 'dark',
    name: 'Nuit Intense',
    bgGradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    fontFamily: 'font-display',
    textColor: '#ffffff',
    fontSize: 'text-3xl',
    filter: 'contrast(1.2)',
    alignment: 'left'
  },
  {
    id: 'vibrant',
    name: 'Vibrant Pop',
    bgGradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    fontFamily: 'font-display',
    textColor: '#ffffff',
    fontSize: 'text-5xl',
    filter: 'saturate(1.5)',
    alignment: 'center'
  }
];

const FILTERS = [
  { id: 'none', name: 'Aucun', value: 'none' },
  { id: 'grayscale', name: 'N&B', value: 'grayscale(1)' },
  { id: 'sepia', name: 'Sépia', value: 'sepia(0.5)' },
  { id: 'blur', name: 'Flou', value: 'blur(4px)' },
  { id: 'vivid', name: 'Vif', value: 'saturate(1.8) contrast(1.1)' },
  { id: 'vintage', name: 'Vintage', value: 'sepia(0.3) contrast(0.9) brightness(1.1)' },
];

export function CreatorDashboard() {
  const [text, setText] = useState('Votre citation ici...');
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('minimal');
  const [fontFamily, setFontFamily] = useState('font-sans');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [fontSize, setFontSize] = useState('text-3xl');
  const [filter, setFilter] = useState('none');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [isExporting, setIsExporting] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'template' | 'text' | 'image' | 'filters'>('template');

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyTemplate = (template: Template) => {
    setSelectedTemplate(template.id);
    setFontFamily(template.fontFamily);
    setTextColor(template.textColor);
    setFontSize(template.fontSize);
    setFilter(template.filter);
    setAlignment(template.alignment);
  };

  const handleAIGenerate = async () => {
    setIsAIThinking(true);
    setAiError(null);
    try {
      const themes = ['Motivation', 'Amour', 'Business', 'Sagesse', 'Futur', 'Paix'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const quote = await generateThemedQuote(randomTheme);
      
      // If the service returns the fallback "La technologie est mieux servie...", it means it might have errored
      if (quote) {
        setText(quote.text);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#1877F2', '#ff6b35']
        });
      }
    } catch (err: any) {
      setAiError(err.message || "L'IA n'est pas disponible.");
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBgImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportImage = async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `quoto-creation-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1877F2', '#ff6b35', '#ffffff']
      });
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const reset = () => {
    setBgImage(null);
    applyTemplate(TEMPLATES[0]);
    setText('Votre citation ici...');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-0 min-h-[calc(100vh-140px)]">
      {/* Design Controls */}
      <aside className="w-full lg:w-80 order-2 lg:order-1 space-y-6">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-black/5 overflow-hidden">
          {/* Module Tabs */}
          <div className="flex border-b border-gray-50">
            {[
              { id: 'template', icon: <Layout size={18} /> },
              { id: 'text', icon: <Type size={18} /> },
              { id: 'image', icon: <ImageIcon size={18} /> },
              { id: 'filters', icon: <Sparkles size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-4 flex items-center justify-center transition-all",
                  activeTab === tab.id ? "text-blue-500 bg-blue-50/50" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab.icon}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'template' && (
                <motion.div
                  key="template-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Choisir un modèle</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => applyTemplate(t)}
                        className={cn(
                          "aspect-video rounded-xl border-2 transition-all overflow-hidden relative group",
                          selectedTemplate === t.id ? "border-blue-500 shadow-lg shadow-blue-500/10" : "border-gray-100 hover:border-gray-200"
                        )}
                        style={{ background: t.bgGradient }}
                      >
                        <span className={cn(
                          "absolute inset-0 flex items-center justify-center text-[10px] font-bold p-2 text-center",
                          t.textColor === '#ffffff' ? 'text-white' : 'text-gray-900'
                        )}>
                          {t.name}
                        </span>
                        {selectedTemplate === t.id && (
                          <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                            <CheckCircle2 size={12} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'text' && (
                <motion.div
                  key="text-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contenu du message</label>
                      <button 
                        onClick={handleAIGenerate}
                        disabled={isAIThinking}
                        className="flex items-center gap-1 text-[10px] font-black text-blue-500 uppercase tracking-tighter hover:underline disabled:opacity-50"
                      >
                        {isAIThinking ? 'IA travaille...' : <><Zap size={10} /> Inspire-moi</>}
                      </button>
                    </div>
                    {aiError && (
                      <div className="bg-red-50 text-red-500 text-[10px] p-3 rounded-xl font-bold animate-pulse">
                        ⚠️ {aiError}
                      </div>
                    )}
                    <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] resize-none"
                      placeholder="Écrivez quelque chose d'inspirant..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Style de police</label>
                    <div className="flex gap-2">
                      <button onClick={() => setFontFamily('font-sans')} className={cn("flex-1 py-3 rounded-xl border transition-all text-xs font-bold", fontFamily === 'font-sans' ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100 text-gray-600")}>Sans</button>
                      <button onClick={() => setFontFamily('font-display')} className={cn("flex-1 py-3 rounded-xl border transition-all text-xs font-bold font-display", fontFamily === 'font-display' ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100 text-gray-600")}>Display</button>
                      <button onClick={() => setFontFamily('font-editorial')} className={cn("flex-1 py-3 rounded-xl border transition-all text-sm italic font-editorial", fontFamily === 'font-editorial' ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-100 text-gray-600")}>Édito</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taille</label>
                    <div className="flex gap-2">
                      {['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'].map((s) => (
                        <button 
                          key={s}
                          onClick={() => setFontSize(s)}
                          className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-bold transition-all",
                            fontSize === s ? "bg-blue-500 text-white border-blue-500" : "bg-white border-gray-100 text-gray-600"
                          )}
                        >
                          {s.split('-')[1].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Couleur & Alignement</label>
                    <div className="flex items-center justify-between gap-4">
                      <input 
                        type="color" 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-10 rounded-full border-none p-0 overflow-hidden cursor-pointer bg-transparent"
                      />
                      <div className="flex bg-gray-50 p-1 rounded-xl">
                        <button onClick={() => setAlignment('left')} className={cn("p-2 rounded-lg transition-all", alignment === 'left' ? "bg-white text-blue-500 shadow-sm" : "text-gray-400")}><AlignLeft size={16} /></button>
                        <button onClick={() => setAlignment('center')} className={cn("p-2 rounded-lg transition-all", alignment === 'center' ? "bg-white text-blue-500 shadow-sm" : "text-gray-400")}><AlignCenter size={16} /></button>
                        <button onClick={() => setAlignment('right')} className={cn("p-2 rounded-lg transition-all", alignment === 'right' ? "bg-white text-blue-500 shadow-sm" : "text-gray-400")}><AlignRight size={16} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'image' && (
                <motion.div
                  key="image-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
                  >
                    {bgImage ? (
                      <div className="relative w-full h-full">
                        <img src={bgImage} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                          Changer l'image
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-blue-100 group-hover:text-blue-500 transition-all">
                          <Upload size={24} />
                        </div>
                        <p className="text-xs font-bold text-gray-500 text-center">Cliquez pour importer<br/><span className="text-[10px] opacity-60 font-medium">PNG, JPG, WEBP</span></p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  
                  {bgImage && (
                    <button 
                      onClick={() => setBgImage(null)}
                      className="w-full py-3 text-red-500 text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={14} /> Supprimer l'image
                    </button>
                  )}
                </motion.div>
              )}

              {activeTab === 'filters' && (
                <motion.div
                  key="filters-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.value)}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group",
                        filter === f.value ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                      )}
                    >
                      <span className="text-sm font-bold uppercase tracking-tighter">{f.name}</span>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden group-hover:bg-gray-200 transition-all">
                         <div className="w-full h-full bg-blue-500/20" style={{ filter: f.value }} />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-gray-50/50 flex gap-3">
             <button
               onClick={reset}
               className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-600 transition-all shadow-sm"
               title="Réinitialiser"
             >
               <RotateCcw size={20} />
             </button>
             <button
               onClick={exportImage}
               disabled={isExporting}
               className="flex-1 bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-50"
             >
               {isExporting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : (
                 <>
                   <Download size={20} />
                   Télécharger
                 </>
               )}
             </button>
          </div>
        </div>

        <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-xl shadow-blue-600/20">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                 <Zap size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Creator Reward Plus</h4>
                <p className="text-[10px] text-white/60">Générez +20% de revenus par image</p>
              </div>
           </div>
           <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
             Activer maintenant
           </button>
        </div>
      </aside>

      {/* Main Preview Area */}
      <main className="flex-1 order-1 lg:order-2">
        <div className="sticky top-20">
          <div className="flex items-center justify-between mb-6 px-4">
             <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 font-display">Mode Création</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Studio Visuel v1.0</p>
             </div>
             <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-500 shadow-sm transition-all lg:hidden">
               <Maximize2 size={20} />
             </button>
          </div>

          <div className="relative group">
            {/* The Actual Creator Canvas */}
            <div 
              ref={canvasRef}
              className="aspect-square w-full max-w-[600px] mx-auto bg-white rounded-[40px] shadow-2xl shadow-black/[0.08] overflow-hidden relative"
              style={{
                background: bgImage ? 'none' : (TEMPLATES.find(t => t.id === selectedTemplate)?.bgGradient || TEMPLATES[0].bgGradient),
                filter: filter
              }}
            >
              {bgImage && (
                <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="Background" />
              )}
              
              <div 
                className={cn(
                  "absolute inset-0 flex flex-col p-12 lg:p-20",
                  alignment === 'center' ? 'items-center justify-center text-center' : 
                  alignment === 'left' ? 'items-start justify-center text-left' : 
                  'items-end justify-center text-right'
                )}
              >
                <motion.p
                  key={`${text}-${fontFamily}-${textColor}-${fontSize}-${alignment}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "relative z-10 font-bold leading-tight drop-shadow-sm",
                    fontFamily,
                    fontSize
                  )}
                  style={{ color: textColor }}
                >
                  {text}
                </motion.p>
                
                <div className="mt-12 flex items-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity grayscale">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs font-black">Q</div>
                  <span className="text-[10px] font-bold tracking-widest uppercase">Quoto Connect</span>
                </div>
              </div>

              {/* Texture Overlays */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            {/* Quick Actions overlay (mobile hint) */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-xl flex items-center gap-6 z-10 lg:hidden">
                <button className="text-gray-400"><Share2 size={20} /></button>
                <div className="w-px h-8 bg-gray-100" />
                <button onClick={exportImage} className="text-blue-500"><Download size={20} /></button>
            </div>
          </div>
          
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-[600px] mx-auto px-4">
             <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                   <Share2 size={18} />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Partage Social</p>
             </div>
             <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                   <Zap size={18} />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Monétisation Auto</p>
             </div>
             <div className="text-center space-y-2">
                <div className="mx-auto w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                   <Maximize2 size={18} />
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Retouche HD</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
