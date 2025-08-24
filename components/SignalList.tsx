
import React from 'react';
import type { Signal } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface SignalListProps {
  signals: Signal[];
  isLoading: boolean;
  onSignalClick: (symbol: string) => void;
}

const SignalList: React.FC<SignalListProps> = ({ signals, isLoading, onSignalClick }) => {
  return (
    <div className="bg-primary rounded-lg shadow-lg p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-text-primary">Active Signals</h2>
      <div className="flex-grow overflow-y-auto max-h-64 pr-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : signals.length > 0 ? (
          <ul className="space-y-3">
            {signals.map((signal) => (
              <li
                key={signal.id}
                className="bg-secondary p-3 rounded-md cursor-pointer transition-transform hover:scale-105 hover:bg-accent/30"
                onClick={() => onSignalClick(signal.symbol)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-text-primary">{signal.symbol}</span>
                  <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">{signal.timeframe}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{signal.rule}</p>
                <div className="text-xs text-text-secondary mt-2 grid grid-cols-2 gap-1">
                  <span>RSI: <span className="text-text-primary">{signal.details.rsi.toFixed(2)}</span></span>
                  <span>VWAP Gap: <span className="text-text-primary">{signal.details.vwap_gap_percent.toFixed(2)}%</span></span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-text-secondary py-10">
            No active signals found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalList;
