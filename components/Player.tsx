import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Play, Pause, RefreshCw, Volume2, Download, BarChart2, Activity, Palette, MessageSquare, X } from 'lucide-react';
import { NarratorAvatar } from './NarratorAvatar';
import { StatsHUD } from './StatsHUD';
import { ChatInterface } from './ChatInterface';
import { EnvironmentEffects } from './EnvironmentEffects';
import { RoastCard } from './RoastCard';
import { CodeStats } from '../types';

interface PlayerProps {
  script: string;
  stats: CodeStats;
  audioBuffer: AudioBuffer | null;
  projectName: string;
  styleId: string;
  onReset: () => void;
  codebase: string;
}

type VisualizerMode = 'bars' | 'wave';
type ColorTheme = 'green' | 'cyan' | 'rose' | 'amber';

const THEMES: Record<ColorTheme, { primary: string; secondary: string; tailwind: string; bg: string }> = {
  green: { primary: '#22c55e', secondary: '#86efac', tailwind: 'text-green-500', bg: 'bg-green-500' },
  cyan: { primary: '#06b6d4', secondary: '#67e8f9', tailwind: 'text-cyan-500', bg: 'bg-cyan-500' },
  rose: { primary: '#f43f5e', secondary: '#fda4af', tailwind: 'text-rose-500', bg: 'bg-rose-500' },
  amber: { primary: '#f59e0b', secondary: '#fcd34d', tailwind: 'text-amber-500', bg: 'bg-amber-500' }
};

export const Player: React.FC<PlayerProps> = ({ script, stats, audioBuffer, projectName, styleId, onReset, codebase }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSurprised, setIsSurprised] = useState(false);
  
  // UI States
  const [showChat, setShowChat] = useState(false);
  const [showRoast, setShowRoast] = useState(false);
  const [visMode, setVisMode] = useState<VisualizerMode>('bars');
  const [visTheme, setVisTheme] = useState<ColorTheme>('green');

  // Refs for audio and visualization
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  
  // Ref for Avatar Mouth Lip-Sync
  const mouthRef = useRef<HTMLDivElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  const isPlayingRef = useRef(false);
  const isSurprisedRef = useRef(false); 
  const visConfigRef = useRef({ mode: visMode, theme: visTheme });

  // --- Transcript Logic ---
  const scriptLines = useMemo(() => script.split('\n').filter(line => line.trim().length > 0), [script]);
  
  // Refined weighting for timing estimation
  const lineRanges = useMemo(() => {
    // TTS usually pauses at periods/newlines. 
    // We add a "phantom" weight to each line to account for this pause, improving sync.
    const CHAR_WEIGHT = 1;
    const PAUSE_WEIGHT = 20; // Equivalent to ~20 chars of silence

    const totalWeight = scriptLines.reduce((acc, line) => acc + (line.length * CHAR_WEIGHT) + PAUSE_WEIGHT, 0);
    
    let accumulated = 0;
    return scriptLines.map(line => {
      const lineWeight = (line.length * CHAR_WEIGHT) + PAUSE_WEIGHT;
      const start = accumulated / totalWeight;
      accumulated += lineWeight;
      const end = accumulated / totalWeight;
      return { start, end };
    });
  }, [scriptLines]);

  // Determine active line index based on progress
  const activeLineIndex = useMemo(() => {
    if (progress >= 100) return scriptLines.length - 1;
    const p = progress / 100;
    return lineRanges.findIndex(range => p >= range.start && p < range.end);
  }, [progress, lineRanges, scriptLines.length]);

  // Auto-scroll to active line
  useEffect(() => {
    if (activeLineRef.current && transcriptContainerRef.current && isPlaying && !showChat) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex, isPlaying, showChat]);

  useEffect(() => {
    visConfigRef.current = { mode: visMode, theme: visTheme };
  }, [visMode, visTheme]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    playAudio();

    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const playAudio = async () => {
    if (!audioBuffer || !audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    } catch (e) {
      console.error("Audio Context Resume Error:", e);
    }

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    source.connect(analyser);
    analyser.connect(audioContextRef.current.destination);

    // Calculate start offset
    const offset = Math.min(pauseTimeRef.current, audioBuffer.duration);
    
    source.start(0, offset);
    
    startTimeRef.current = audioContextRef.current.currentTime - offset;
    sourceNodeRef.current = source;
    
    setIsPlaying(true);
    isPlayingRef.current = true;

    source.onended = () => {
      // Check if it ended naturally (approximate check) or was stopped
      if (
        audioContextRef.current && 
        audioBuffer &&
        audioContextRef.current.currentTime - startTimeRef.current >= audioBuffer.duration - 0.5
      ) {
         setIsPlaying(false);
         isPlayingRef.current = false;
         pauseTimeRef.current = 0;
         setProgress(100);
         cancelAnimationFrame(animationFrameRef.current);
         setIsSurprised(false);
         isSurprisedRef.current = false;
         if (mouthRef.current) mouthRef.current.style.transform = 'scaleY(1)';
      }
    };

    drawVisualizer();
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) { /* ignore */ }
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsSurprised(false);
      isSurprisedRef.current = false;
      cancelAnimationFrame(animationFrameRef.current);
      if (mouthRef.current) mouthRef.current.style.transform = 'scaleY(1)';
    }
  };

  const stopAudio = () => {
     if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e) {}
     }
     setIsPlaying(false);
     isPlayingRef.current = false;
     setIsSurprised(false);
     isSurprisedRef.current = false;
     pauseTimeRef.current = 0;
     cancelAnimationFrame(animationFrameRef.current);
     if (mouthRef.current) mouthRef.current.style.transform = 'scaleY(1)';
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleLineClick = (index: number) => {
    if (!audioBuffer || !audioContextRef.current) return;
    
    const range = lineRanges[index];
    // Set time to the start of the selected line
    const newTime = range.start * audioBuffer.duration;
    
    pauseTimeRef.current = newTime;
    
    if (isPlaying) {
      playAudio(); // Restart at new time
    } else {
      setProgress(range.start * 100); // Just update visual
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const volumeArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlayingRef.current) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      const { mode, theme: themeKey } = visConfigRef.current;
      const theme = THEMES[themeKey];
      
      if (audioContextRef.current && audioBuffer) {
        const current = audioContextRef.current.currentTime - startTimeRef.current;
        const percent = Math.min((current / audioBuffer.duration) * 100, 100);
        setProgress(percent);
      }
      
      if (analyserRef.current) {
         analyserRef.current.getByteFrequencyData(volumeArray);
         let sum = 0;
         const voiceBins = Math.floor(bufferLength / 2);
         for (let i = 0; i < voiceBins; i++) { sum += volumeArray[i]; }
         const avg = sum / voiceBins;
         
         if (mouthRef.current) {
           const noise = (Math.random() - 0.5) * 0.2;
           const scale = 0.4 + (avg / 150) + noise; 
           const clampedScale = Math.max(0.2, Math.min(scale, 2.5));
           mouthRef.current.style.transform = `scaleY(${clampedScale})`;
         }

         const SURPRISE_THRESHOLD_ON = 190;
         const SURPRISE_THRESHOLD_OFF = 160;

         if (!isSurprisedRef.current && avg > SURPRISE_THRESHOLD_ON) {
            setIsSurprised(true);
            isSurprisedRef.current = true;
         } else if (isSurprisedRef.current && avg < SURPRISE_THRESHOLD_OFF) {
            setIsSurprised(false);
            isSurprisedRef.current = false;
         }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === 'bars') {
        analyserRef.current!.getByteFrequencyData(dataArray);
        const barWidth = (canvas.width / bufferLength) * 2; 
        let barHeight;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height; 
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, theme.primary);
          gradient.addColorStop(1, theme.secondary);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, canvas.height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          ctx.fill();
          x += barWidth;
        }
      } else {
        analyserRef.current!.getByteTimeDomainData(dataArray);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = theme.primary;
        ctx.shadowBlur = 4;
        ctx.shadowColor = theme.primary;
        ctx.beginPath();
        const sliceWidth = canvas.width * 1.0 / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; 
          const y = v * (canvas.height / 2);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    };
    draw();
  };

  const currentTheme = THEMES[visTheme];

  // Helper to format transcript with highlighting
  const renderTranscriptLine = (line: string, index: number) => {
    const isActive = index === activeLineIndex;
    
    // Regex to match [[Filename]]
    const parts = line.split(/(\[\[.*?\]\])/g);
    
    return (
      <div
        key={index} 
        onClick={() => handleLineClick(index)}
        ref={isActive ? activeLineRef : null}
        className={`
          group relative cursor-pointer px-4 py-2 transition-all duration-300 rounded-r-xl border-l-2
          ${isActive 
            ? `opacity-100 scale-[1.01] ${currentTheme.tailwind} border-${currentTheme.primary} font-medium bg-white/5` 
            : 'opacity-40 border-transparent hover:opacity-80 hover:bg-white/5 hover:border-slate-700'
          }
        `}
      >
        <span className="text-xs opacity-0 group-hover:opacity-100 absolute -left-12 top-1/2 -translate-y-1/2 text-slate-500 font-mono transition-opacity">
          {isPlaying ? 'JUMP' : 'PLAY'}
        </span>
        <p className="leading-relaxed">
          {parts.map((part, i) => {
            if (part.startsWith('[[') && part.endsWith(']]')) {
              const fileName = part.slice(2, -2);
              return (
                <span key={i} className={`inline-block mx-1 px-1.5 py-0.5 rounded ${currentTheme.bg} bg-opacity-20 text-${currentTheme.primary} font-mono text-sm border border-${currentTheme.primary} border-opacity-30`}>
                  {fileName}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Roast Card Modal */}
      <RoastCard 
        isOpen={showRoast} 
        onClose={() => setShowRoast(false)} 
        stats={stats} 
        projectName={projectName} 
        styleId={styleId} 
      />

      {/* Main Interface Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative min-h-[700px]">
        
        {/* Dynamic Background Effects */}
        <EnvironmentEffects styleId={styleId} />
        
        {/* Grain Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none z-0"></div>

        {/* LEFT PANEL */}
        <div className="md:col-span-4 bg-slate-950/60 p-6 md:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-800 relative z-10">
           
           <div className="mt-2 mb-6">
              <NarratorAvatar 
                styleId={styleId} 
                isPlaying={isPlaying} 
                className="w-40 h-40"
                mouthRef={mouthRef}
                isSurprised={isSurprised}
              />
           </div>

           <div className="text-center space-y-2 mb-6 w-full">
              <h2 className="text-xl font-serif text-slate-100 font-bold leading-tight line-clamp-2" title={projectName}>
                {projectName}
              </h2>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 ${currentTheme.tailwind} text-xs font-bold tracking-wide uppercase`}>
                <span className={`w-2 h-2 rounded-full ${currentTheme.bg} animate-pulse`}></span>
                {styleId} Mode
              </div>
           </div>
           
           <div className="w-full mb-6">
             <StatsHUD stats={stats} />
           </div>

           <div className="mt-auto grid grid-cols-2 gap-3 w-full">
              <button 
                 onClick={onReset}
                 className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm font-medium border border-slate-700 hover:border-slate-600"
              >
                <RefreshCw size={16} /> Reset
              </button>
              <button 
                 onClick={() => setShowRoast(true)}
                 className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-all text-sm font-medium border border-slate-700 hover:border-slate-600"
              >
                <Download size={16} /> Save
              </button>
           </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-8 p-6 md:p-8 flex flex-col relative z-10 bg-gradient-to-br from-slate-900/50 to-slate-900/80 overflow-hidden">
           
           {/* Visualizer Area */}
           <div className="relative w-full h-48 bg-black/40 rounded-2xl border border-slate-800 overflow-hidden mb-6 group shrink-0">
               <canvas 
                 ref={canvasRef} 
                 width={800} 
                 height={200} 
                 className="w-full h-full opacity-80"
               />
               
               {/* Visualizer Settings (Bottom Left) */}
               <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 flex gap-1">
                     {(Object.keys(THEMES) as ColorTheme[]).map(t => (
                       <button key={t} onClick={() => setVisTheme(t)} className={`w-4 h-4 rounded-md ${THEMES[t].bg} ${visTheme===t ? 'ring-1 ring-white scale-110': 'opacity-50 hover:opacity-100'}`} />
                     ))}
                  </div>
               </div>

               {/* Visualization Mode (Top Right) */}
               <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 flex gap-1">
                   <button onClick={() => setVisMode('bars')} className={`p-1 rounded ${visMode==='bars' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><BarChart2 size={12}/></button>
                   <button onClick={() => setVisMode('wave')} className={`p-1 rounded ${visMode==='wave' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}><Activity size={12}/></button>
                 </div>
               </div>
           </div>

           {/* Playback Controls */}
           <div className="flex items-center gap-6 mb-6 shrink-0">
              <button 
                onClick={togglePlay}
                className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${currentTheme.bg} text-slate-900 shadow-lg shadow-${currentTheme.primary}/20 hover:scale-105 active:scale-95 transition-all`}
              >
                 {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>

              <div className="flex-grow space-y-2">
                 <div className="flex justify-between text-xs font-mono text-slate-500 uppercase tracking-wider">
                    <span>Playback Status</span>
                    <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${currentTheme.bg} transition-all duration-100 ease-linear`}
                      style={{ width: `${progress}%` }}
                    />
                 </div>
              </div>
           </div>

           {/* Transcript / Chat Area (Flex Grow) */}
           <div className="flex-grow flex flex-col min-h-0 relative bg-slate-950/50 rounded-2xl border border-slate-800/50 overflow-hidden">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-900/50 flex justify-between items-center shrink-0 z-20 relative">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   {showChat ? (
                     <>
                        <MessageSquare size={14} className={currentTheme.tailwind} />
                        Ask the Narrator
                     </>
                   ) : (
                     <>
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                       Live Transcript
                     </>
                   )}
                 </span>

                 <button
                    onClick={() => setShowChat(!showChat)}
                    className={`
                      text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all flex items-center gap-2
                      ${showChat 
                        ? 'bg-slate-800 text-white' 
                        : `bg-${currentTheme.primary} bg-opacity-10 text-${currentTheme.primary} hover:bg-opacity-20`
                      }
                    `}
                 >
                    {showChat ? (
                      <><X size={14} /> Close Chat</>
                    ) : (
                      <><MessageSquare size={14} /> Ask Narrator</>
                    )}
                 </button>
              </div>

              {/* Content Area */}
              <div className="relative flex-grow overflow-hidden">
                 
                 {/* Transcript View */}
                 <div 
                    ref={transcriptContainerRef}
                    className={`absolute inset-0 p-6 overflow-y-auto font-serif text-lg leading-relaxed text-slate-300 space-y-6 custom-scrollbar transition-opacity duration-300 ${showChat ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                 >
                    {scriptLines.map((line, i) => renderTranscriptLine(line, i))}
                    <div className="h-32"></div> {/* Spacer for bottom scroll */}
                 </div>

                 {/* Chat View Overlay */}
                 {showChat && (
                    <div className="absolute inset-0 z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                       <ChatInterface 
                          isOpen={showChat} 
                          onClose={() => setShowChat(false)} 
                          styleId={styleId} 
                          projectName={projectName}
                          codebase={codebase}
                        />
                    </div>
                 )}
              </div>
           </div>

        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.8);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};