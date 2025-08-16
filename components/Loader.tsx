
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex items-start gap-3 justify-start">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-lg">
          🎓
        </div>
      <div className="max-w-xl rounded-2xl p-4 bg-slate-700 rounded-bl-none flex items-center space-x-2">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};
