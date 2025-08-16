
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700 shadow-md flex items-center space-x-4">
      <div className="text-3xl">🎓</div>
      <div>
        <h1 className="text-xl font-bold text-white">IIBS AI Career Counselor</h1>
        <p className="text-sm text-slate-400">Your 24/7 Placement Support Partner</p>
      </div>
    </header>
  );
};
