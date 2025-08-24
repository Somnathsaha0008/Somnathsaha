
import React, { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../types';
import { Message } from './Message';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  isDisabled: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, isDisabled }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-800/80 sm:rounded-t-lg shadow-2xl backdrop-blur-md">
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 overscroll-behavior-contain">
        {messages.map((msg, index) => (
          <Message 
            key={msg.id} 
            message={msg}
            isLastMessage={index === messages.length - 1}
            isLoading={isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/80 sm:rounded-b-lg backdrop-blur-md">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} isDisabled={isDisabled} />
      </div>
    </div>
  );
};