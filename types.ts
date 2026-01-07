export interface AnalysisResult {
  extractedText: string;
  description: string;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResult | null;
}

export enum FileStatus {
  IDLE = 'IDLE',
  SELECTED = 'SELECTED',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}