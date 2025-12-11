import React, { useState, useEffect } from 'react';

interface NarratorAvatarProps {
  styleId: string;
  isPlaying: boolean;
  className?: string;
  mouthRef?: React.RefObject<HTMLDivElement | null>;
  isSurprised?: boolean;
}

export const NarratorAvatar: React.FC<NarratorAvatarProps> = ({ styleId, isPlaying, className, mouthRef, isSurprised = false }) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [headTransform, setHeadTransform] = useState({ x: 0, y: 0, rotate: 0 });
  const [blink, setBlink] = useState(false);
  const [breath, setBreath] = useState(false);

  // Breathing Loop (Subtle scale)
  useEffect(() => {
    const interval = setInterval(() => {
        setBreath(prev => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Behavior Loop (Blinking, Looking around)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let blinkTimeout: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
        setBlink(true);
        blinkTimeout = setTimeout(() => setBlink(false), 180);
        // Random blink interval between 3s and 7s
        setTimeout(triggerBlink, Math.random() * 4000 + 3000);
    };
    
    // Start blink loop
    triggerBlink();

    const updateBehavior = () => {
      // Determine timing based on state
      const minDelay = isPlaying ? 150 : 2000;
      const maxDelay = isPlaying ? 800 : 5000;
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      
      timeoutId = setTimeout(() => {
        if (isPlaying) {
          // Active state: fast scanning (reading code)
          setPupilOffset({
            x: (Math.random() - 0.5) * 10, 
            y: (Math.random() - 0.5) * 4 
          });
          setHeadTransform(prev => ({ 
            ...prev, 
            rotate: (Math.random() - 0.5) * 3,
            y: (Math.random() - 0.5) * 2
          }));
        } else {
          // Idle state: casual observation
          const random = Math.random();
          if (random > 0.6) {
             // Look somewhere
             const lookX = (Math.random() - 0.5) * 20;
             const lookY = (Math.random() - 0.5) * 8;
             setPupilOffset({ x: lookX, y: lookY });
             setHeadTransform({
               x: lookX * 0.3, 
               y: lookY * 0.3,
               rotate: lookX * 0.4
             });
          } else {
            // Return to center
            setPupilOffset({ x: 0, y: 0 });
            setHeadTransform({ x: 0, y: 0, rotate: 0 });
          }
        }
        updateBehavior();
      }, delay);
    };

    updateBehavior();
    return () => {
        clearTimeout(timeoutId);
        clearTimeout(blinkTimeout);
    };
  }, [isPlaying]);
  
  // Style configurations
  const getStyleConfig = () => {
    switch (styleId) {
      case 'grumpy':
        return {
          container: 'rounded-[1.5rem] border-amber-900/40 bg-gradient-to-b from-amber-950 via-slate-900 to-black',
          glow: 'shadow-none',
          // Eyes
          eyeSclera: 'bg-amber-100/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border border-amber-900/30',
          iris: 'bg-[radial-gradient(circle_at_center,_#b45309_0%,_#451a03_90%)] w-5 h-5 rounded-full opacity-90 border border-amber-900/50', // Amber gradient
          pupil: 'bg-black w-1.5 h-1.5 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)]',
          eyeShape: 'w-12 h-8 rounded-lg', 
          eyelid: 'bg-amber-950/90 h-[40%] translate-y-0 border-b border-amber-900/50', // Droopy eyelids
          // Features
          brow: 'bg-amber-900 h-2.5 w-12 rounded-sm shadow-md',
          browLeftPos: 'rotate-12 translate-y-2',
          browRightPos: '-rotate-12 translate-y-2',
          mouth: 'bg-amber-900/80 w-10 h-1.5 rounded-full opacity-80',
          nose: 'bg-amber-900/20 w-3 h-4 rounded-full blur-[2px]',
          cheek: 'hidden'
        };
      case 'hype':
        return {
          container: 'rounded-[2.5rem] border-cyan-500/40 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950',
          glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)]',
          // Eyes
          eyeSclera: 'bg-cyan-950/30 border-2 border-cyan-400/30 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)]',
          iris: 'bg-[radial-gradient(circle_at_center,_#22d3ee_0%,_#0e7490_80%)] w-8 h-8 rounded-full opacity-80 animate-pulse',
          pupil: 'bg-white w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]', // Dilated pupils
          eyeShape: 'w-11 h-11 rounded-full', 
          eyelid: 'bg-cyan-900 h-0 -translate-y-full', // Wide open
          // Features
          brow: 'bg-cyan-500/80 h-1.5 w-10 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]',
          browLeftPos: '-rotate-12 -translate-y-3',
          browRightPos: 'rotate-12 -translate-y-3',
          mouth: 'bg-cyan-400/80 w-8 h-2 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]',
          nose: 'bg-cyan-500/10 w-2 h-2 rounded-full blur-[1px]',
          cheek: 'w-3 h-2 bg-cyan-400/30 rounded-full blur-[4px]'
        };
      case 'noir':
        return {
          container: 'rounded-xl border-slate-600 bg-gradient-to-b from-slate-800 to-black',
          glow: 'shadow-2xl shadow-black',
          // Eyes
          eyeSclera: 'bg-slate-200 border-t-4 border-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]',
          iris: 'bg-[radial-gradient(circle_at_center,_#475569_0%,_#0f172a_100%)] w-3 h-3 rounded-full',
          pupil: 'bg-black w-1 h-1 rounded-full',
          eyeShape: 'w-10 h-3 rounded-sm',
          eyelid: 'hidden',
          // Features
          brow: 'bg-slate-500 h-1 w-10',
          browLeftPos: 'rotate-6 translate-y-1',
          browRightPos: '-rotate-6 translate-y-1',
          mouth: 'bg-slate-600 w-8 h-1 rounded-none',
          nose: 'bg-black/40 w-1 h-6 blur-[1px]',
          cheek: 'hidden'
        };
      case 'fantasy':
        return {
          container: 'rounded-full border-purple-500/30 bg-gradient-to-b from-fuchsia-950 via-purple-950 to-slate-950',
          glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
          // Eyes
          eyeSclera: 'bg-purple-950/50 border border-purple-500/40 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]',
          iris: 'bg-[radial-gradient(circle_at_center,_#d8b4fe_0%,_#7e22ce_70%,_#3b0764_100%)] w-5 h-5 rounded-full',
          pupil: 'bg-black w-1 h-4 rounded-[50%] blur-[0.5px]', // Cat/Dragon slit eye
          eyeShape: 'w-9 h-9 rounded-full rotate-45',
          eyelid: 'bg-purple-900/50 h-0',
          // Features
          brow: 'bg-purple-400/60 h-1.5 w-10 rounded-full blur-[0.5px]',
          browLeftPos: '-rotate-[25deg] -translate-y-2',
          browRightPos: 'rotate-[25deg] -translate-y-2',
          mouth: 'bg-purple-400/60 w-6 h-1.5 rounded-full blur-[0.5px]',
          nose: 'bg-purple-500/20 w-2 h-4 rounded-b-full blur-sm',
          cheek: 'w-4 h-4 bg-purple-500/20 rounded-full blur-md'
        };
      case 'nature':
      default:
        return {
          container: 'rounded-[2.2rem] border-emerald-500/20 bg-gradient-to-b from-green-900/60 via-emerald-950 to-slate-900',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.05)]',
          // Eyes
          eyeSclera: 'bg-slate-100 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)] border border-emerald-900/20',
          iris: 'bg-[radial-gradient(circle_at_center,_#34d399_0%,_#059669_60%,_#064e3b_100%)] w-5 h-5 rounded-full shadow-sm',
          pupil: 'bg-slate-900 w-2 h-2 rounded-full',
          eyeShape: 'w-8 h-8 rounded-full',
          eyelid: 'bg-emerald-900/50 h-0',
          // Features
          brow: 'bg-emerald-800 h-2 w-8 rounded-full opacity-90',
          browLeftPos: '-rotate-6 -translate-y-1',
          browRightPos: 'rotate-6 -translate-y-1',
          mouth: 'bg-emerald-200/90 w-7 h-2 rounded-b-xl rounded-t-sm',
          nose: 'bg-emerald-900/30 w-3 h-3 rounded-full blur-[2px]',
          cheek: 'w-3 h-3 bg-emerald-500/10 rounded-full blur-sm'
        };
    }
  };

  const config = getStyleConfig();

  // Surprised logic overrides
  const browLeft = isSurprised ? '-rotate-20 -translate-y-4' : config.browLeftPos;
  const browRight = isSurprised ? 'rotate-20 -translate-y-4' : config.browRightPos;
  const eyeScale = isSurprised ? 'scale-110' : 'scale-100';

  return (
    <div className={`relative w-40 h-40 mx-auto group ${className}`}>
      
      {/* Head Container with Breath Animation */}
      <div 
        className={`
          absolute inset-0 border-2 ${config.container} ${config.glow}
          overflow-hidden transition-all duration-1000 ease-in-out
          shadow-2xl
        `}
        style={{ transform: `scale(${breath ? 1.02 : 1})` }}
      >
         {/* Noise Texture */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
         
         {/* Internal Light/Shadow Gradient for Spherical Depth */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0.3)_80%)] pointer-events-none"></div>

         {/* Face Container (Moves with headTransform) */}
         <div 
           className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-500 ease-out will-change-transform"
           style={{ transform: `translate(${headTransform.x}px, ${headTransform.y}px) rotate(${headTransform.rotate}deg)` }}
         >
            
            {/* Brows */}
            <div className="flex gap-3 mb-2 transition-all duration-300 relative z-30">
               <div className={`${config.brow} transform transition-transform duration-300 ${browLeft}`} />
               <div className={`${config.brow} transform transition-transform duration-300 ${browRight}`} />
            </div>

            {/* Eyes Row */}
            <div className={`flex gap-3 mb-3 relative z-20 items-center transition-transform duration-200 ${eyeScale}`}>
               
               {/* Left Eye */}
               <div className={`
                  relative overflow-hidden flex items-center justify-center transition-all duration-200
                  ${config.eyeSclera} ${config.eyeShape}
                  ${blink ? '!h-[2px] mt-[calc(50%-1px)] border-0 bg-slate-800' : ''}
               `}>
                  {/* Iris & Pupil */}
                  <div 
                    className="relative flex items-center justify-center transition-transform duration-100 ease-linear"
                    style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
                  >
                     <div className={`${config.iris} flex items-center justify-center shadow-inner relative`}>
                        {/* Detail in Iris */}
                        <div className="absolute inset-0 rounded-full opacity-30 bg-[conic-gradient(from_0deg,transparent_0_deg,rgba(0,0,0,0.5)_20deg,transparent_40deg)]"></div>
                        <div className={`${config.pupil} relative z-10`} />
                        {/* Dynamic Glint */}
                        {!blink && styleId !== 'noir' && (
                           <div className="absolute top-[15%] right-[20%] w-[25%] h-[25%] bg-white rounded-full blur-[0.5px] opacity-90 shadow-[0_0_2px_white]"></div>
                        )}
                        {/* Secondary faint glint */}
                        {!blink && styleId !== 'noir' && (
                           <div className="absolute bottom-[20%] left-[20%] w-[10%] h-[10%] bg-white rounded-full blur-[0.5px] opacity-40"></div>
                        )}
                     </div>
                  </div>
                  
                  {/* Eyelid (Upper) for expression */}
                  {!blink && (
                     <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-500 ${config.eyelid}`}></div>
                  )}
               </div>

               {/* Right Eye */}
               <div className={`
                  relative overflow-hidden flex items-center justify-center transition-all duration-200
                  ${config.eyeSclera} ${config.eyeShape}
                  ${blink ? '!h-[2px] mt-[calc(50%-1px)] border-0 bg-slate-800' : ''}
               `}>
                   <div 
                    className="relative flex items-center justify-center transition-transform duration-100 ease-linear"
                    style={{ transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` }}
                  >
                     <div className={`${config.iris} flex items-center justify-center shadow-inner relative`}>
                        <div className="absolute inset-0 rounded-full opacity-30 bg-[conic-gradient(from_0deg,transparent_0_deg,rgba(0,0,0,0.5)_20deg,transparent_40deg)]"></div>
                        <div className={`${config.pupil} relative z-10`} />
                        {!blink && styleId !== 'noir' && (
                           <div className="absolute top-[15%] right-[20%] w-[25%] h-[25%] bg-white rounded-full blur-[0.5px] opacity-90 shadow-[0_0_2px_white]"></div>
                        )}
                        {!blink && styleId !== 'noir' && (
                           <div className="absolute bottom-[20%] left-[20%] w-[10%] h-[10%] bg-white rounded-full blur-[0.5px] opacity-40"></div>
                        )}
                     </div>
                  </div>

                  {/* Eyelid (Upper) */}
                  {!blink && (
                     <div className={`absolute top-0 left-0 right-0 z-20 transition-all duration-500 ${config.eyelid}`}></div>
                  )}
               </div>
            </div>

            {/* Nose (Subtle Anchor) */}
            <div className={`mb-3 ${config.nose}`}></div>

            {/* Cheeks (Optional) */}
            {config.cheek && (
               <div className="absolute top-[58%] flex gap-12 w-full justify-center opacity-60 pointer-events-none">
                  <div className={config.cheek}></div>
                  <div className={config.cheek}></div>
               </div>
            )}

            {/* Mouth */}
            <div className="h-4 flex items-center justify-center relative">
               <div 
                  ref={mouthRef}
                  className={`
                    ${config.mouth}
                    shadow-[0_2px_5px_rgba(0,0,0,0.2)]
                    transition-all duration-100 ease-out origin-center
                  `}
               />
            </div>
         </div>
      </div>
      
      {/* Decorative Outer Ring (Idle Animation) */}
      <div className="absolute -inset-4 border border-white/5 rounded-full opacity-20 animate-[spin_12s_linear_infinite] pointer-events-none"></div>
    </div>
  );
};

export default NarratorAvatar;