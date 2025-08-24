
import React, { useState, useEffect, useCallback } from 'react';
import type { Candle, Signal, Timeframe } from '../types';
import { SYMBOLS, TIMEFRAMES } from '../constants';
import { fetchCandleData, fetchSignals } from '../services/cryptoService';
import { analyzeSignalsWithGemini } from '../services/geminiService';
import CryptoChart from './CryptoChart';
import SignalList from './SignalList';
import AnalysisDisplay from './AnalysisDisplay';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
    const [selectedSymbol, setSelectedSymbol] = useState<string>(SYMBOLS[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(TIMEFRAMES[2]);
    const [candleData, setCandleData] = useState<Candle[]>([]);
    const [signals, setSignals] = useState<Signal[]>([]);
    const [analysis, setAnalysis] = useState<string>('');

    const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
    const [isLoadingSignals, setIsLoadingSignals] = useState<boolean>(true);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadCandleData = useCallback(async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const data = await fetchCandleData(selectedSymbol, selectedTimeframe);
            setCandleData(data);
        } catch (err) {
            setError('Failed to fetch candle data.');
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    }, [selectedSymbol, selectedTimeframe]);

    const loadSignals = useCallback(async () => {
        setIsLoadingSignals(true);
        try {
            const activeSignals = await fetchSignals();
            setSignals(activeSignals);
        } catch (err) {
            setError('Failed to fetch signals.');
            console.error(err);
        } finally {
            setIsLoadingSignals(false);
        }
    }, []);

    const handleAnalysisRequest = useCallback(async () => {
        if (!signals.length) {
            setAnalysis("No active signals to analyze.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysis('');
        setError(null);
        try {
            const result = await analyzeSignalsWithGemini(signals);
            setAnalysis(result);
        } catch (err) {
            setError('Failed to get analysis from Gemini.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    }, [signals]);

    useEffect(() => {
        loadCandleData();
    }, [loadCandleData]);

    useEffect(() => {
        loadSignals();
        const interval = setInterval(loadSignals, 5 * 60 * 1000); // Refresh signals every 5 minutes
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            <div className="lg:col-span-3 bg-primary rounded-lg shadow-lg p-4 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedSymbol}
                            onChange={(e) => setSelectedSymbol(e.target.value)}
                            className="bg-secondary text-text-primary border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary p-1 rounded-md">
                        {TIMEFRAMES.map(tf => (
                            <button
                                key={tf}
                                onClick={() => setSelectedTimeframe(tf)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedTimeframe === tf ? 'bg-accent text-white' : 'text-text-secondary hover:bg-gray-700'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow min-h-[400px]">
                    {isLoadingData ? <div className="flex items-center justify-center h-full"><LoadingSpinner /></div> : <CryptoChart data={candleData} />}
                </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-4">
                <SignalList signals={signals} isLoading={isLoadingSignals} onSignalClick={(symbol) => setSelectedSymbol(symbol)} />
                <AnalysisDisplay 
                    analysis={analysis}
                    isLoading={isAnalyzing} 
                    onAnalyze={handleAnalysisRequest}
                    hasSignals={signals.length > 0}
                />
            </div>
             {error && <div className="lg:col-span-4 bg-negative/20 text-negative border border-negative rounded-md p-4 mt-4">{error}</div>}
        </div>
    );
};

export default Dashboard;
