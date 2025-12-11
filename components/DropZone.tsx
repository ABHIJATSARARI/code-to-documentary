import React, { useCallback, useState } from 'react';
import { Upload, FileArchive, FolderOpen } from 'lucide-react';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        onFileSelected(file);
      } else {
        alert("Please upload a .zip file");
      }
    }
  }, [onFileSelected, disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  }, [onFileSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        group relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500 ease-out
        flex flex-col items-center justify-center p-12 text-center cursor-pointer
        shadow-2xl backdrop-blur-sm
        ${isDragging 
          ? 'border-green-500 bg-green-900/20 scale-[1.02] shadow-green-900/20' 
          : 'border-slate-700 hover:border-green-500/50 hover:bg-slate-800/30 bg-slate-900/20'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
      `}
    >
      <input
        type="file"
        accept=".zip"
        onChange={handleInputChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
      />
      
      {/* Animated Glow on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 flex flex-col items-center space-y-6 relative">
        <div className={`
          relative p-6 rounded-2xl transition-all duration-300
          ${isDragging 
            ? 'bg-green-500 text-slate-900 rotate-12 scale-110' 
            : 'bg-slate-800/80 text-green-400 group-hover:text-green-300 group-hover:bg-slate-800 group-hover:scale-110 group-hover:-rotate-3 shadow-lg border border-slate-700'
          }
        `}>
          {isDragging ? <FolderOpen size={48} /> : <FileArchive size={48} />}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-serif text-slate-100 group-hover:text-white transition-colors">
            Upload Repository
          </h3>
          <p className="text-slate-400 group-hover:text-slate-300 transition-colors max-w-sm text-sm leading-relaxed">
            Drag & drop your codebase <span className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-green-400 border border-slate-700">.zip</span> here to begin the expedition.
          </p>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none rotate-12">
         <Upload size={240} />
      </div>
    </div>
  );
};
