import React from 'react';
import { Loader2, Trees, ScrollText, Music, FileSearch } from 'lucide-react';
import { ProcessingStatus } from '../types';

interface ProcessingViewProps {
  status: ProcessingStatus;
}

export const ProcessingView: React.FC<ProcessingViewProps> = ({ status }) => {
  const getIcon = () => {
    switch (status.step) {
      case 'PROCESSING_ZIP': return <FileSearch className="animate-pulse text-yellow-400" size={64} />;
      case 'GENERATING_SCRIPT': return <ScrollText className="animate-bounce text-blue-400" size={64} />;
      case 'GENERATING_AUDIO': return <Music className="animate-pulse text-purple-400" size={64} />;
      default: return <Trees className="text-green-500" size={64} />;
    }
  };

  const getTitle = () => {
    switch (status.step) {
      case 'PROCESSING_ZIP': return "Exploring the Undergrowth";
      case 'GENERATING_SCRIPT': return "Observing Behaviors";
      case 'GENERATING_AUDIO': return "Recording Narration";
      default: return "Loading...";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full"></div>
        {getIcon()}
      </div>
      <h2 className="text-2xl font-serif text-white mb-2">{getTitle()}</h2>
      <p className="text-slate-400 flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} />
        {status.details}
      </p>
      
      {/* Progress Bar Visual */}
      <div className="w-64 h-1 bg-slate-800 rounded-full mt-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-300 animate-[shimmer_2s_infinite]"></div>
      </div>
    </div>
  );
};
