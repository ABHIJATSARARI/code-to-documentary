import React from 'react';

interface EnvironmentEffectsProps {
  styleId: string;
}

export const EnvironmentEffects: React.FC<EnvironmentEffectsProps> = ({ styleId }) => {
  if (styleId === 'noir') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-slate-900/50"></div>
        {/* Rain Effect */}
        <div className="rain-container absolute inset-0 opacity-30">
           {Array.from({ length: 40 }).map((_, i) => (
             <div 
               key={i}
               className="absolute bg-slate-400 w-[1px] h-16 animate-rain"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `-${Math.random() * 20}%`,
                 animationDuration: `${0.5 + Math.random() * 0.5}s`,
                 animationDelay: `${Math.random() * 2}s`
               }}
             />
           ))}
        </div>
        <style>{`
          @keyframes rain {
            0% { transform: translateY(-100vh); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          .animate-rain {
            animation: rain linear infinite;
          }
        `}</style>
      </div>
    );
  }

  if (styleId === 'nature') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         {/* Fireflies / Spores */}
         {Array.from({ length: 20 }).map((_, i) => (
           <div 
             key={i}
             className="absolute w-1 h-1 bg-green-400 rounded-full blur-[1px] animate-float-random opacity-40"
             style={{
               left: `${Math.random() * 100}%`,
               top: `${Math.random() * 100}%`,
               animationDuration: `${3 + Math.random() * 4}s`,
               animationDelay: `${Math.random() * 2}s`
             }}
           />
         ))}
         <style>{`
           @keyframes float-random {
             0%, 100% { transform: translate(0, 0); opacity: 0; }
             25% { opacity: 0.6; }
             50% { transform: translate(${Math.random()*20}px, -${Math.random()*40}px); }
             75% { opacity: 0.6; }
           }
           .animate-float-random {
             animation: float-random ease-in-out infinite;
           }
         `}</style>
      </div>
    );
  }

  if (styleId === 'hype') {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_2px,transparent_2px),linear-gradient(90deg,rgba(18,18,18,0)_2px,transparent_2px)] bg-[size:40px_40px] [background-position:center] opacity-20"></div>
        {/* Moving Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b2_1px,transparent_1px),linear-gradient(to_bottom,#0891b2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10 animate-pulse"></div>
      </div>
    );
  }

  if (styleId === 'grumpy') {
    return (
       <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         {/* Flickering fluorescent light effect */}
         <div className="absolute inset-0 bg-amber-100/5 animate-flicker mix-blend-overlay"></div>
         <style>{`
           @keyframes flicker {
             0% { opacity: 0.05; }
             5% { opacity: 0.1; }
             10% { opacity: 0.05; }
             15% { opacity: 0.02; }
             20% { opacity: 0.05; }
             100% { opacity: 0.05; }
           }
           .animate-flicker {
             animation: flicker 4s infinite steps(10);
           }
         `}</style>
       </div>
    );
  }

  if (styleId === 'fantasy') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Magical Particles */}
            {Array.from({ length: 15 }).map((_, i) => (
             <div 
               key={i}
               className="absolute w-2 h-2 bg-purple-500/30 rounded-full blur-sm animate-rise"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: '100%',
                 animationDuration: `${2 + Math.random() * 3}s`,
                 animationDelay: `${Math.random() * 2}s`
               }}
             />
           ))}
           <style>{`
            @keyframes rise {
                0% { transform: translateY(0) scale(1); opacity: 0; }
                50% { opacity: 0.5; }
                100% { transform: translateY(-100vh) scale(0); opacity: 0; }
            }
            .animate-rise {
                animation: rise linear infinite;
            }
           `}</style>
        </div>
      );
  }

  return null;
};