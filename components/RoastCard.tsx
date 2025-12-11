import React from 'react';
import { CodeStats } from '../types';
import { X, Award, Share2 } from 'lucide-react';

interface RoastCardProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CodeStats;
  projectName: string;
  styleId: string;
}

export const RoastCard: React.FC<RoastCardProps> = ({ isOpen, onClose, stats, projectName, styleId }) => {
  if (!isOpen) return null;

  const getVerdict = () => {
    const avg = (stats.spaghettiIndex + (100 - stats.modernityScore) + stats.techDebtLevel) / 3;
    if (avg > 80) return "ABSOLUTE CHAOS";
    if (avg > 60) return "SPAGHETTI FACTORY";
    if (avg > 40) return "NEEDS LOVE";
    return "ACTUALLY DECENT";
  };

  const copyToClipboard = () => {
    const text = `I just had my code analyzed by Code-to-Documentary!\n\nProject: ${projectName}\nVerdict: ${getVerdict()}\n🍝 Spaghetti Index: ${stats.spaghettiIndex}%\n💀 Tech Debt: ${stats.techDebtLevel}%\n\nTry it yourself!`;
    navigator.clipboard.writeText(text);
    alert("Summary copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-300">
         <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
         
         <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border border-slate-700 text-yellow-500 shadow-xl">
               <Award size={32} />
            </div>
            
            <div>
               <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Certificate of Analysis</h2>
               <h1 className="text-2xl font-serif font-bold text-white mb-2">{projectName}</h1>
               <div className="inline-block bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-black uppercase border border-red-500/20">
                 Verdict: {getVerdict()}
               </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-slate-800">
               <div className="text-center">
                  <div className="text-xl font-mono font-bold text-yellow-500">{stats.spaghettiIndex}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Spaghetti</div>
               </div>
               <div className="text-center">
                  <div className="text-xl font-mono font-bold text-blue-400">{stats.modernityScore}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Modernity</div>
               </div>
               <div className="text-center">
                  <div className="text-xl font-mono font-bold text-red-500">{stats.techDebtLevel}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Tech Debt</div>
               </div>
            </div>

            <p className="text-sm text-slate-400 italic">
               "Analyzed by a {styleId} AI narrator who has seen things you wouldn't believe."
            </p>

            <button 
              onClick={copyToClipboard}
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
               <Share2 size={16} /> Share Results
            </button>
         </div>
      </div>
    </div>
  );
};