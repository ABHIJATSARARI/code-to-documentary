import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { ProcessingView } from './components/ProcessingView';
import { Player } from './components/Player';
import { SplashScreen } from './components/SplashScreen';
import { Tour } from './components/Tour';
import { processZipFile } from './services/fileService';
import { generateDocumentaryScript, generateNarrationAudio } from './services/geminiService';
import { AppState, ProcessingStatus, DocumentaryData } from './types';
import { Sprout, Mic, Sparkles, Zap, Coffee, Search, Sword } from 'lucide-react';

const VOICES = [
  { id: 'Fenrir', label: 'Fenrir' },
  { id: 'Zephyr', label: 'Zephyr' },
  { id: 'Puck', label: 'Puck' },
  { id: 'Charon', label: 'Charon' },
  { id: 'Kore', label: 'Kore' },
];

const STYLES = [
  { id: 'nature', label: 'Nature Doc', icon: <Sprout size={16} />, desc: 'Attenborough Style' },
  { id: 'grumpy', label: 'Senior Dev', icon: <Coffee size={16} />, desc: 'Cynical Review' },
  { id: 'hype', label: 'Tech Evangelist', icon: <Zap size={16} />, desc: 'Silicon Valley Hype' },
  { id: 'noir', label: 'Noir Detective', icon: <Search size={16} />, desc: 'Gritty Mystery' },
  { id: 'fantasy', label: 'Epic Fantasy', icon: <Sword size={16} />, desc: 'Code as Magic' },
];

const TOUR_STEPS = [
  {
    title: 'Welcome to the Wild',
    content: 'Transform your static code into a living, breathing nature documentary. Let\'s get you equipped for the expedition.',
    position: 'center' as const,
    target: 'intro'
  },
  {
    title: 'Set the Scene',
    content: 'Choose your narrative style. From a calming nature doc to a cynical senior developer code review.',
    position: 'bottom' as const,
    target: 'styles'
  },
  {
    title: 'Choose Your Guide',
    content: 'Select the perfect narrator voice. "Fenrir" is great for drama, "Puck" for energy.',
    position: 'bottom' as const,
    target: 'voices'
  },
  {
    title: 'Upload Repository',
    content: 'Drag and drop your project zip file here. We will extract, analyze, and chronicle the life of your codebase.',
    position: 'top' as const,
    target: 'dropzone'
  },
  {
    title: 'Powered by Gemini',
    content: 'Using Gemini 3 Pro\'s massive 2M token context window, we observe your entire project architecture at once to find the most interesting behaviors.',
    position: 'center' as const,
    target: 'tech'
  }
];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [status, setStatus] = useState<ProcessingStatus>({ step: '' });
  const [data, setData] = useState<DocumentaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');
  const [selectedStyle, setSelectedStyle] = useState<string>('nature');

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Start tour automatically after splash
    setTimeout(() => setShowTour(true), 500);
  };

  const handleTourNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      setShowTour(false);
    }
  };

  const handleTourPrev = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setError(null);
      setAppState(AppState.PROCESSING_ZIP);
      setStatus({ step: 'PROCESSING_ZIP', details: `Extracting ${file.name}...` });

      // 1. Unzip
      const { content, name } = await processZipFile(file);
      
      // 2. Generate Script
      setAppState(AppState.GENERATING_SCRIPT);
      setStatus({ step: 'GENERATING_SCRIPT', details: 'Gemini is observing the codebase...' });
      const { script, stats } = await generateDocumentaryScript(content, name, selectedStyle);

      // 3. Generate Audio
      setAppState(AppState.GENERATING_AUDIO);
      setStatus({ step: 'GENERATING_AUDIO', details: `Synthesizing narration (${selectedVoice})...` });
      
      let audioBuffer;
      try {
        audioBuffer = await generateNarrationAudio(script, { voice: selectedVoice });
      } catch (audioError: any) {
        console.error("TTS Generation specific error:", audioError);
        
        const rawMessage = audioError.message || "";
        let userMessage = `The narrator encountered an issue with "${selectedVoice}".`;

        if (rawMessage.includes("API_KEY") || rawMessage.includes("API key") || rawMessage.includes("403")) {
          userMessage = "Access denied. Please ensure your API key is valid and billing is enabled.";
        } else if (rawMessage.includes("429") || rawMessage.includes("quota")) {
          userMessage = "Rate limit exceeded. The narrator needs a break. Please try again later.";
        } else if (rawMessage.includes("not found") || rawMessage.includes("404")) {
           userMessage = `The voice "${selectedVoice}" is currently unavailable. Please select a different guide.`;
        } else {
           userMessage += " Please try a different voice or ensure your API key is valid.";
        }
        
        throw new Error(userMessage);
      }

      setData({
        projectName: name,
        script,
        stats,
        audioBuffer,
        codebase: content // Store for chat context
      });
      setAppState(AppState.PLAYING);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setData(null);
    setError(null);
  };

  // Helper to determine if an element is currently highlighted by the tour
  const isHighlighted = (targetName: string) => {
    return showTour && TOUR_STEPS[tourStep].target === targetName;
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      {showTour && (
        <Tour 
          step={tourStep}
          totalSteps={TOUR_STEPS.length}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onClose={() => setShowTour(false)}
          title={TOUR_STEPS[tourStep].title}
          content={TOUR_STEPS[tourStep].content}
          position={TOUR_STEPS[tourStep].position}
        />
      )}
      
      <div className={`min-h-screen bg-slate-950 text-slate-200 selection:bg-green-500/30 overflow-x-hidden transition-opacity duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
          {/* Subtle Grid Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>

        {/* Navbar */}
        <nav className="border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={reset}>
              <div className="p-1.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Sprout className="text-green-500 w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg tracking-tight text-slate-100">
                Code<span className="text-green-500 italic">2</span>Doc
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                <Sparkles size={12} className="text-yellow-500" />
                <span>Gemini 3 Pro + Neural TTS</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative container mx-auto px-6 py-12 flex flex-col items-center min-h-[calc(100vh-64px)] z-10">
          
          {appState === AppState.IDLE && (
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className={`text-center mb-10 space-y-6 transition-opacity duration-500 ${showTour && !isHighlighted('intro') ? 'opacity-30' : 'opacity-100'}`}>
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-green-400 text-xs font-medium tracking-wide uppercase mb-4">
                  Developer Tools Nature Documentary
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-slate-100 leading-tight">
                  The <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 italic pr-2">Wild</span> 
                  Side of Code
                </h1>
                <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Upload your repository and let AI narrate the hidden life of your functions, bugs, and spaghetti code.
                </p>
              </div>

              {/* Settings Container */}
              <div className={`mb-10 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm transition-all duration-500 ${
                 isHighlighted('styles') || isHighlighted('voices')
                 ? 'relative z-50 ring-2 ring-green-500 scale-105 shadow-[0_0_50px_rgba(34,197,94,0.3)] bg-slate-900'
                 : showTour ? 'opacity-30 blur-[1px]' : ''
              }`}>
                
                {/* Style Selection */}
                <div className={`mb-8 ${isHighlighted('styles') ? 'relative z-50' : ''}`}>
                  <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Sparkles size={12} className="text-green-500" />
                    <span>Select Narrative Style</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`group relative flex flex-col items-center p-3 rounded-xl transition-all duration-300 border ${
                          selectedStyle === style.id
                            ? 'bg-slate-800 border-green-500/50 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                            : 'bg-slate-800/30 border-transparent hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className={`mb-2 p-2 rounded-full ${selectedStyle === style.id ? 'bg-green-500 text-slate-900' : 'bg-slate-700/50 text-slate-400 group-hover:text-green-400 group-hover:bg-slate-700'}`}>
                          {style.icon}
                        </div>
                        <span className="text-sm font-medium">{style.label}</span>
                        <span className="text-[10px] opacity-60 mt-1">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Selection */}
                <div className={`pt-6 border-t border-slate-800/50 ${isHighlighted('voices') ? 'relative z-50' : ''}`}>
                  <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Mic size={12} className="text-green-500" />
                    <span>Select Voice</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {VOICES.map(voice => (
                      <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedVoice === voice.id 
                            ? 'bg-green-600 text-white shadow-lg' 
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {voice.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
              
              <div className={`transition-all duration-500 ${
                  isHighlighted('dropzone') 
                  ? 'relative z-50 ring-2 ring-green-500 rounded-3xl scale-105 shadow-[0_0_50px_rgba(34,197,94,0.3)] bg-slate-900' 
                  : showTour ? 'opacity-30 blur-[1px]' : ''
                }`}>
                <DropZone onFileSelected={handleFileSelect} />
              </div>
              
              <div className={`mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-center transition-all duration-500 ${
                  isHighlighted('tech')
                  ? 'relative z-50'
                  : showTour ? 'opacity-30 blur-[1px]' : ''
                }`}>
                 <div className={`p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 transition-all ${isHighlighted('tech') ? 'bg-slate-800 border-green-500/50' : ''}`}>
                    <div className="text-green-500 font-bold text-xl mb-1">2M+</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Context Window</div>
                 </div>
                 <div className={`p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 transition-all ${isHighlighted('tech') ? 'bg-slate-800 border-blue-500/50' : ''}`}>
                    <div className="text-blue-400 font-bold text-xl mb-1">HD</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Neural Audio</div>
                 </div>
                 <div className={`p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 transition-all ${isHighlighted('tech') ? 'bg-slate-800 border-purple-500/50' : ''}`}>
                    <div className="text-purple-400 font-bold text-xl mb-1">100%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Instant Fun</div>
                 </div>
              </div>
            </div>
          )}

          {(appState === AppState.PROCESSING_ZIP || 
            appState === AppState.GENERATING_SCRIPT || 
            appState === AppState.GENERATING_AUDIO) && (
            <ProcessingView status={status} />
          )}

          {appState === AppState.PLAYING && data && (
            <Player 
              script={data.script} 
              stats={data.stats}
              audioBuffer={data.audioBuffer} 
              projectName={data.projectName}
              styleId={selectedStyle}
              onReset={reset}
              codebase={data.codebase}
            />
          )}

          {appState === AppState.ERROR && (
            <div className="text-center max-w-md animate-in zoom-in duration-300 p-8 rounded-2xl bg-red-950/20 border border-red-900/50 backdrop-blur-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Nature is Unforgiving</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
              <button 
                onClick={reset}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-all hover:scale-105 font-medium border border-slate-700 hover:border-slate-600 shadow-lg"
              >
                Try Again
              </button>
            </div>
          )}

        </main>
      </div>
    </>
  );
}