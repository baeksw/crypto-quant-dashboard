
export interface Candle {
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Indicators
  sma: number | null;
  ema_fast: number | null;
  ema_slow: number | null;
  vwap: number | null;
  rsi: number | null;
  macd: number | null;
  macd_signal: number | null;
  macd_hist: number | null;
  bb_upper: number | null;
  bb_middle: number | null;
  bb_lower: number | null;
}

export interface Signal {
  id: string;
  symbol: string;
  timeframe: string;
  datetime: string;
  rule: string;
  details: {
    vwap_gap_percent: number;
    rsi: number;
    volume_rank: number;
  };
}

export type Timeframe = '5m' | '15m' | '1h' | '4h' | '1d';
