
import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="bg-primary p-4 border-b border-secondary">
        <h1 className="text-2xl font-bold text-text-primary">Crypto Quant Dashboard</h1>
        <p className="text-text-secondary">Market analysis powered by technical indicators and Gemini AI.</p>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
