
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { getChatStream } from './services/geminiService';
import type { Message } from './types';
import { Sender } from './types';
import { INITIAL_BOT_MESSAGE } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: `bot-initial-${Date.now()}`,
      text: INITIAL_BOT_MESSAGE,
      sender: Sender.BOT,
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: Sender.USER,
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    const botMessageId = `bot-response-${Date.now()}`;
    // Add a placeholder for the bot's response
    setMessages(prevMessages => [
      ...prevMessages,
      { id: botMessageId, text: '', sender: Sender.BOT },
    ]);

    try {
      // Pass the history *before* the new user message
      const history = [...messages];
      const stream = await getChatStream(history, text);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: msg.text + chunkText }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to get response from Gemini:", error);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === botMessageId
            ? { ...msg, text: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
};

export default App;
