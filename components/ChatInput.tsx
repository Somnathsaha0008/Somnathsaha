
import React, { useState, useCallback } from 'react';
import { SendIcon } from './icons/SendIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isDisabled }) => {
  const [text, setText] = useState('');

  const handleTranscriptReady = useCallback((transcript: string) => {
    setText(transcript);
  }, []);

  const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition({
    onTranscriptReady: handleTranscriptReady,
  });

  const effectivelyDisabled = isLoading || isDisabled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !effectivelyDisabled) {
      if (isListening) stopListening();
      onSendMessage(text);
      setText('');
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setText('');
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          isDisabled ? "Service not available" : 
          isListening ? "Listening..." : "Ask me anything about your career..."
        }
        disabled={effectivelyDisabled}
        className="flex-1 bg-slate-700 border border-transparent rounded-full py-3 px-5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-slate-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        autoComplete="off"
      />
      {hasRecognitionSupport && !isDisabled && (
         <button
          type="button"
          onClick={handleMicClick}
          disabled={isLoading}
          className={`p-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-red-600 text-white hover:bg-red-500'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          <MicrophoneIcon />
        </button>
      )}
      <button
        type="submit"
        disabled={effectivelyDisabled || !text.trim()}
        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 active:scale-95 transform-gpu focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 disabled:bg-slate-600 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
        aria-label="Send message"
      >
        <SendIcon />
      </button>
    </form>
  );
};
