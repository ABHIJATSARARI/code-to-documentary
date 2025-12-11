import React, { useEffect, useState } from 'react';
import { Sprout, Terminal, Binary } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setStage(1), 500),   // Terminal appears
      setTimeout(() => setStage(2), 2000),  // Nature takes over
      setTimeout(() => setStage(3), 4000),  // Title reveal
      setTimeout(() => setStage(4), 5500),  // Subtitle
      setTimeout(() => {
        setStage(5); // Fade out
        setTimeout(onComplete, 1000); // Unmount
      }, 6500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-1000 ${stage === 5 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-900/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-900/20 rounded-full blur-[80px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Icon Animation Container */}
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          
          {/* Stage 1: Code / Terminal */}
          <div className={`absolute transition-all duration-1000 transform ${stage >= 2 ? 'scale-150 opacity-0' : stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
             <Terminal size={64} className="text-slate-500" />
          </div>

          {/* Stage 1.5: Binary Particles (Simulated) */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${stage === 1 ? 'opacity-100' : 'opacity-0'}`}>
             <Binary size={24} className="absolute -top-4 -right-4 text-green-500/50 animate-bounce" />
             <Binary size={16} className="absolute -bottom-2 -left-4 text-green-500/30 animate-pulse" />
          </div>

          {/* Stage 2: Nature Transformation */}
          <div className={`absolute transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) transform ${stage >= 2 ? 'opacity-100 scale-125' : 'opacity-0 scale-50 rotate-180'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
              <Sprout size={80} className="text-green-500 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
        </div>

        {/* Text Container */}
        <div className="h-24 text-center">
          {/* Title */}
          <h1 className={`text-4xl md:text-5xl font-serif text-slate-100 tracking-tight transition-all duration-1000 transform ${stage >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Code<span className="text-green-500 italic">2</span>Documentary
          </h1>
          
          {/* Subtitle / Presented By */}
          <div className={`mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm font-mono transition-all duration-1000 ${stage >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            <span className="w-8 h-[1px] bg-slate-700"></span>
            <span>NARRATED BY GEMINI</span>
            <span className="w-8 h-[1px] bg-slate-700"></span>
          </div>
        </div>
      </div>
    </div>
  );
};
