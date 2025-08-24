import React from 'react';
import type { Candle } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

interface CryptoChartProps {
  data: Candle[];
}

const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-secondary p-3 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="font-bold text-text-primary">{new Date(label).toLocaleString()}</p>
                <p className={`text-${data.close >= data.open ? 'positive' : 'negative'}`}>Close: {data.close.toFixed(2)}</p>
                <p>Open: {data.open.toFixed(2)}</p>
                <p>High: {data.high.toFixed(2)}</p>
                <p>Low: {data.low.toFixed(2)}</p>
                <p className="text-accent">Volume: {data.volume.toLocaleString()}</p>
                <p className="text-yellow-400">VWAP: {data.vwap?.toFixed(2) ?? 'N/A'}</p>
                <p className="text-purple-400">RSI: {data.rsi?.toFixed(2) ?? 'N/A'}</p>
            </div>
        );
    }
    return null;
};

const CryptoChart: React.FC<CryptoChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-secondary">No data available for this selection.</div>;
  }
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
            <linearGradient id="colorBB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2962ff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2962ff" stopOpacity={0}/>
            </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
        <XAxis 
            dataKey="datetime" 
            tickFormatter={formatXAxis} 
            stroke="#8a8e97" 
            tick={{ fontSize: 12 }} 
            minTickGap={60}
        />
        <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#8a8e97" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : ''}
            domain={['dataMin', 'dataMax']}
        />
        <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#8a8e97" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => typeof value === 'number' ? `${(value / 1000).toFixed(0)}k` : ''}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{fontSize: "12px"}}/>
        
        <Area yAxisId="left" type="monotone" dataKey="bb_lower" stroke="none" fill="url(#colorBB)" name="Bollinger Lower" />
        <Area yAxisId="left" type="monotone" dataKey="bb_upper" stroke="none" fill="url(#colorBB)" name="Bollinger Upper" />

        <Line yAxisId="left" type="monotone" dataKey="close" stroke="#d1d4dc" dot={false} strokeWidth={2} name="Close Price" />
        <Line yAxisId="left" type="monotone" dataKey="ema_fast" stroke="#f0b90b" dot={false} strokeWidth={1} strokeDasharray="5 5" name="EMA Fast" />
        <Line yAxisId="left" type="monotone" dataKey="ema_slow" stroke="#82ffff" dot={false} strokeWidth={1} strokeDasharray="5 5" name="EMA Slow" />
        <Line yAxisId="left" type="monotone" dataKey="vwap" stroke="#e91e63" dot={false} strokeWidth={1.5} name="VWAP" />

        <Bar yAxisId="right" dataKey="volume" name="Volume" barSize={5}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CryptoChart;