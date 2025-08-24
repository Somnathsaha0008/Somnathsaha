
import React from 'react';
import type { Message as MessageType } from '../types';
import { Sender } from '../types';

interface MessageProps {
  message: MessageType;
  isLastMessage: boolean;
  isLoading: boolean;
}

export const Message: React.FC<MessageProps> = ({ message, isLastMessage, isLoading }) => {
  const isUser = message.sender === Sender.USER;
  const isBot = message.sender === Sender.BOT;

  const showTypingCursor = isBot && isLastMessage && isLoading;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {isBot && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-xl shadow-lg ring-2 ring-slate-700">
          🎓
        </div>
      )}
      <div
        className={`max-w-xl rounded-2xl p-4 text-white shadow-xl whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 rounded-br-none'
            : 'bg-gradient-to-br from-slate-700 to-slate-600 rounded-bl-none'
        }`}
      >
        {message.text}
        {showTypingCursor && <span className="typing-cursor"></span>}
      </div>
    </div>
  );
};