
import type { Candle, Signal, Timeframe } from '../types';
import { SYMBOLS } from '../constants';

// A generic retry utility with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  initialDelay = 500,
): Promise<T> => {
  let lastError: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} of ${retries} failed. Retrying in ${initialDelay * Math.pow(2, i)}ms...`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, initialDelay * Math.pow(2, i)));
      }
    }
  }
  console.error(`All ${retries} retry attempts failed.`);
  throw lastError;
};


// --- Mock Data Generation ---

const generateMockCandle = (prevCandle: Partial<Candle>, time: Date): Candle => {
  const open = prevCandle.close ?? 10000;
  const change = (Math.random() - 0.5) * open * 0.05;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * open * 0.01;
  const low = Math.min(open, close) - Math.random() * open * 0.01;
  const volume = Math.random() * 100 + 50;
  
  return {
    datetime: time.toISOString(),
    open,
    high,
    low,
    close,
    volume,
    sma: null,
    ema_fast: null,
    ema_slow: null,
    vwap: null,
    rsi: null,
    macd: null,
    macd_signal: null,
    macd_hist: null,
    bb_upper: null,
    bb_middle: null,
    bb_lower: null,
  };
};

const calculateIndicators = (candles: Candle[]): Candle[] => {
    // This is a simplified indicator calculation for frontend demonstration.
    // A real implementation would be much more complex.
    const smaPeriod = 20;
    const emaFastPeriod = 12;
    const emaSlowPeriod = 26;
    const rsiPeriod = 14;

    return candles.map((c, i, arr) => {
        if (i < smaPeriod) return c;

        const slice = arr.slice(i - smaPeriod + 1, i + 1);
        const middle_band = slice.reduce((sum, current) => sum + current.close, 0) / smaPeriod;
        const std_dev = Math.sqrt(slice.reduce((sum, current) => sum + Math.pow(current.close - middle_band, 2), 0) / smaPeriod);
        
        const vwapSlice = arr.slice(0, i + 1);
        const totalPV = vwapSlice.reduce((sum, current) => sum + ((current.high + current.low + current.close) / 3) * current.volume, 0);
        const totalVolume = vwapSlice.reduce((sum, current) => sum + current.volume, 0);

        // Simple EMA calculation
        const ema_fast = arr.slice(i - emaFastPeriod + 1, i+1).reduce((sum, val) => sum + val.close, 0) / emaFastPeriod;
        const ema_slow = arr.slice(i - emaSlowPeriod + 1, i+1).reduce((sum, val) => sum + val.close, 0) / emaSlowPeriod;

        // Simple RSI calculation
        let gains = 0;
        let losses = 0;
        const rsiSlice = arr.slice(i - rsiPeriod + 1, i + 1);
        for(let j=1; j<rsiSlice.length; j++) {
            const diff = rsiSlice[j].close - rsiSlice[j-1].close;
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        const avgGain = gains / rsiPeriod;
        const avgLoss = losses / rsiPeriod;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;


        return {
            ...c,
            sma: middle_band,
            bb_middle: middle_band,
            bb_upper: middle_band + 2 * std_dev,
            bb_lower: middle_band - 2 * std_dev,
            vwap: totalVolume > 0 ? totalPV / totalVolume : c.close,
            ema_fast: ema_fast,
            ema_slow: ema_slow,
            rsi: avgLoss === 0 ? 100 : 100 - (100 / (1 + rs)),
        };
    });
};

const generateCandleData = (symbol: string, timeframe: Timeframe): Candle[] => {
  const candles: Candle[] = [];
  let currentTime = new Date();
  const intervalMinutes = { '5m': 5, '15m': 15, '1h': 60, '4h': 240, '1d': 1440 }[timeframe];
  
  let lastCandle: Partial<Candle> = { close: 50000 + (symbol.charCodeAt(4) - 65) * 1000 + Math.random() * 5000 };

  for (let i = 0; i < 200; i++) {
    const candleTime = new Date(currentTime.getTime() - (199-i) * intervalMinutes * 60 * 1000);
    const newCandle = generateMockCandle(lastCandle, candleTime);
    candles.push(newCandle);
    lastCandle = newCandle;
  }
  
  return calculateIndicators(candles);
};

// --- Mock API Functions ---

const _fetchCandleDataUnreliable = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  console.log(`Fetching mock data for ${symbol} - ${timeframe}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  if (Math.random() < 0.1) { // 10% chance of failure
    throw new Error("Failed to fetch candle data from the mock server.");
  }

  return generateCandleData(symbol, timeframe);
};

/**
 * Fetches candle data for a given symbol and timeframe with automatic retries.
 */
export const fetchCandleData = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  return withRetry(() => _fetchCandleDataUnreliable(symbol, timeframe));
};

const _fetchSignalsUnreliable = async (): Promise<Signal[]> => {
  console.log("Fetching mock signals...");
  await new Promise(resolve => setTimeout(resolve, 300));

  if (Math.random() < 0.1) { // 10% chance of failure
    throw new Error("Failed to fetch signals from the mock server.");
  }

  const signals: Signal[] = [];
  const numSignals = Math.floor(Math.random() * 4); // 0 to 3 signals

  for (let i = 0; i < numSignals; i++) {
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const vwap_gap_percent = 0.2 + Math.random() * 0.8;
    const rsi = 30 + Math.random() * 15;
    
    signals.push({
      id: `signal-${Date.now()}-${i}`,
      symbol: symbol,
      timeframe: '15m',
      datetime: new Date().toISOString(),
      rule: 'VWAP Gap & Low RSI',
      details: {
        vwap_gap_percent: parseFloat(vwap_gap_percent.toFixed(2)),
        rsi: parseFloat(rsi.toFixed(2)),
        volume_rank: Math.floor(Math.random() * 30) + 1,
      }
    });
  }

  return signals;
};

/**
 * Fetches active trading signals with automatic retries.
 */
export const fetchSignals = async (): Promise<Signal[]> => {
  return withRetry(() => _fetchSignalsUnreliable());
};
