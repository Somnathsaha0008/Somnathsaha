
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { getChatStream, isApiConfigured } from './services/geminiService';
import type { Message } from './types';
import { Sender } from './types';
import { INITIAL_BOT_MESSAGE } from './constants';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(true);
  const { speak, cancel, isSpeaking, hasSynthesisSupport } = useSpeechSynthesis();

  useEffect(() => {
    if (isApiConfigured) {
      setMessages([
        {
          id: `bot-initial-${Date.now()}`,
          text: INITIAL_BOT_MESSAGE,
          sender: Sender.BOT,
        },
      ]);
    } else {
      setMessages([
        {
          id: `bot-error-${Date.now()}`,
          text: "Welcome! I'm the IIBS AI Career Counselor.\n\nIt seems the application is not configured correctly, so I'm unable to connect to my services. Please contact the administrator to set up the API key.",
          sender: Sender.BOT,
        },
      ]);
    }
  }, []);
  
  const handleTtsToggle = useCallback(() => {
    setIsTtsEnabled(prev => {
      const newState = !prev;
      if (!newState && isSpeaking) {
        cancel();
      }
      return newState;
    });
  }, [isSpeaking, cancel]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !isApiConfigured) return;

    if (isSpeaking) cancel();
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      sender: Sender.USER,
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    const botMessageId = `bot-response-${Date.now()}`;
    setMessages(prevMessages => [
      ...prevMessages,
      { id: botMessageId, text: '', sender: Sender.BOT },
    ]);
    
    let fullBotResponse = '';

    try {
      const history = [...messages];
      const stream = await getChatStream(history, text);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullBotResponse += chunkText;
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: fullBotResponse }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to get response from Gemini:", error);
      fullBotResponse = 'Sorry, I encountered an error. Please try again.';
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === botMessageId
            ? { ...msg, text: fullBotResponse }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      if (isTtsEnabled && fullBotResponse && hasSynthesisSupport) {
        speak(fullBotResponse);
      }
    }
  }, [messages, isTtsEnabled, speak, hasSynthesisSupport, isSpeaking, cancel]);

  return (
    <div className="flex flex-col h-dvh bg-transparent text-white font-sans">
      <Header 
        isTtsEnabled={isTtsEnabled}
        onTtsToggle={handleTtsToggle}
        hasSynthesisSupport={hasSynthesisSupport}
      />
      <main className="flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          isDisabled={!isApiConfigured}
        />
      </main>
    </div>
  );
};

export default App;
