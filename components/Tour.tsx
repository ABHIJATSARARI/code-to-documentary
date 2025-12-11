import React from 'react';
import { ArrowRight, ChevronLeft, X, Map } from 'lucide-react';

interface TourProps {
  step: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  title: string;
  content: string;
  position?: 'center' | 'top' | 'bottom';
}

export const Tour: React.FC<TourProps> = ({ 
  step, 
  totalSteps, 
  onNext, 
  onPrev, 
  onClose, 
  title, 
  content,
  position = 'center' 
}) => {
  // Determine card position classes
  let positionClasses = "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"; // Default center
  
  if (position === 'bottom') {
    positionClasses = "bottom-12 left-1/2 -translate-x-1/2";
  } else if (position === 'top') {
    positionClasses = "top-24 left-1/2 -translate-x-1/2";
  }

  return (
    <>
      {/* Backdrop with hole punch effect via simple opacity for now, relying on z-index of highlighted elements in parent */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-[2px] z-40 transition-opacity duration-500 animate-in fade-in" />

      {/* Tour Card */}
      <div className={`fixed z-50 w-[90%] max-w-md ${positionClasses} transition-all duration-500 ease-out`}>
        <div className="bg-slate-900/90 border border-slate-700/50 p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden group">
          
          {/* Decorative gradients */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-colors"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors"></div>

          {/* Header */}
          <div className="relative flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
              <Map size={14} />
              <span>Expedition Guide</span>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="relative mb-8 space-y-2">
            <h3 className="text-2xl font-serif text-slate-100">{title}</h3>
            <p className="text-slate-400 leading-relaxed text-sm">
              {content}
            </p>
          </div>

          {/* Footer / Controls */}
          <div className="relative flex items-center justify-between">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-green-500' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {step > 0 && (
                <button 
                  onClick={onPrev}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                onClick={onNext}
                className="flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-full text-sm font-bold transition-transform hover:scale-105 active:scale-95"
              >
                {step === totalSteps - 1 ? 'Start Journey' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
