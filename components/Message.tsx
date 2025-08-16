
import React from 'react';
import type { Message as MessageType } from '../types';
import { Sender } from '../types';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isBot = message.sender === Sender.BOT;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-lg">
          🎓
        </div>
      )}
      <div
        className={`max-w-xl rounded-2xl p-4 text-white shadow-md whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 rounded-br-none'
            : 'bg-slate-700 rounded-bl-none'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};
