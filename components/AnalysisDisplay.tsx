
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface AnalysisDisplayProps {
  analysis: string;
  isLoading: boolean;
  onAnalyze: () => void;
  hasSignals: boolean;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, isLoading, onAnalyze, hasSignals }) => {
  return (
    <div className="bg-primary rounded-lg shadow-lg p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-text-primary">Gemini AI Analysis</h2>
      <div className="flex-grow overflow-y-auto max-h-64 text-sm text-text-secondary pr-2 mb-4 whitespace-pre-wrap">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : analysis ? (
          analysis
        ) : (
          <div className="text-center py-10">Click below to get an AI-powered market summary based on active signals.</div>
        )}
      </div>
      <button
        onClick={onAnalyze}
        disabled={isLoading || !hasSignals}
        className="w-full bg-accent text-white font-semibold py-2 px-4 rounded-md transition-colors hover:bg-blue-500 disabled:bg-secondary disabled:cursor-not-allowed disabled:text-text-secondary"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Market Signals'}
      </button>
    </div>
  );
};

export default AnalysisDisplay;
