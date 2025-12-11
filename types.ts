export enum AppState {
  IDLE = 'IDLE',
  PROCESSING_ZIP = 'PROCESSING_ZIP',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}

export interface ProcessingStatus {
  step: string;
  details?: string;
}

export interface CodeStats {
  spaghettiIndex: number; // 0-100 (Higher is worse)
  modernityScore: number; // 0-100 (Higher is better)
  techDebtLevel: number; // 0-100 (Higher is worse)
}

export interface DocumentaryData {
  projectName: string;
  script: string;
  stats: CodeStats;
  audioBuffer: AudioBuffer | null;
  codebase: string; // Added for Chat context
}