
import React from 'react';
import { SpeakerOnIcon } from './icons/SpeakerOnIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HeaderProps {
    isTtsEnabled: boolean;
    onTtsToggle: () => void;
    hasSynthesisSupport: boolean;
    onClearChat: () => void;
    canClear: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isTtsEnabled, onTtsToggle, hasSynthesisSupport, onClearChat, canClear }) => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-lg p-4 border-b border-slate-700/50 shadow-md flex items-center space-x-2 sm:space-x-4 sticky top-0 z-10">
      <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">🎓</div>
      <div className="flex-1">
        <h1 className="text-xl font-bold text-white filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">IIBS AI Career Counselor</h1>
        <p className="text-sm text-slate-400">Your 24/7 Placement Support Partner</p>
      </div>
       <button
        onClick={onClearChat}
        disabled={!canClear}
        className="text-slate-300 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Clear chat"
        title="Clear chat"
      >
        <TrashIcon />
      </button>
       {hasSynthesisSupport && (
        <button
          onClick={onTtsToggle}
          className="text-slate-300 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
          aria-label={isTtsEnabled ? 'Disable voice output' : 'Enable voice output'}
          title={isTtsEnabled ? 'Disable voice output' : 'Enable voice output'}
        >
          {isTtsEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
        </button>
      )}
    </header>
  );
};
