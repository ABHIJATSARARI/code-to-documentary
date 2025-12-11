import React, { useEffect, useState } from 'react';
import { CodeStats } from '../types';
import { Skull, Zap, Activity } from 'lucide-react';

interface StatsHUDProps {
  stats: CodeStats;
}

export const StatsHUD: React.FC<StatsHUDProps> = ({ stats }) => {
  const [animatedStats, setAnimatedStats] = useState({
    spaghettiIndex: 0,
    modernityScore: 0,
    techDebtLevel: 0
  });

  useEffect(() => {
    // Animate bars on mount
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 100);
    return () => clearTimeout(timer);
  }, [stats]);

  const getSpaghettiColor = (val: number) => {
    if (val < 30) return 'bg-green-500';
    if (val < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getModernityColor = (val: number) => {
    if (val < 30) return 'bg-slate-500';
    if (val < 60) return 'bg-blue-400';
    return 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]';
  };

  const getDebtColor = (val: number) => {
    if (val < 30) return 'bg-emerald-500';
    if (val < 70) return 'bg-orange-500';
    return 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]';
  };

  return (
    <div className="w-full mt-6 space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">
        Vital Signs
      </h3>
      
      {/* Spaghetti Index */}
      <div className="group">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-300">
             <Activity size={12} className="text-yellow-500" />
             Spaghetti Index
          </span>
          <span className="font-mono text-slate-400">{animatedStats.spaghettiIndex}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getSpaghettiColor(animatedStats.spaghettiIndex)}`}
            style={{ width: `${animatedStats.spaghettiIndex}%` }}
          />
        </div>
      </div>

      {/* Modernity Score */}
      <div className="group">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-300">
             <Zap size={12} className="text-cyan-400" />
             Modernity Score
          </span>
          <span className="font-mono text-slate-400">{animatedStats.modernityScore}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getModernityColor(animatedStats.modernityScore)}`}
            style={{ width: `${animatedStats.modernityScore}%` }}
          />
        </div>
      </div>

      {/* Tech Debt */}
      <div className="group">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="flex items-center gap-1.5 text-slate-300">
             <Skull size={12} className="text-rose-500" />
             Tech Debt
          </span>
          <span className="font-mono text-slate-400">{animatedStats.techDebtLevel}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${getDebtColor(animatedStats.techDebtLevel)}`}
            style={{ width: `${animatedStats.techDebtLevel}%` }}
          />
        </div>
      </div>

    </div>
  );
};