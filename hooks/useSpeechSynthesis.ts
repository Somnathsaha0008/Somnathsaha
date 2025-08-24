
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  hasSynthesisSupport: boolean;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn('Speech Synthesis API not supported.');
    }

    const handleVoicesChanged = () => {
        // The voices list is loaded asynchronously. This is a good place to
        // potentially update voice selection logic if it were implemented.
    };

    if (synthRef.current) {
        synthRef.current.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
        if (synthRef.current) {
            synthRef.current.onvoiceschanged = null;
        }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current || !text) return;

    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };
    
    // Optional: Select a specific voice if desired
    // const voices = synthRef.current.getVoices();
    // utterance.voice = voices.find(v => v.name === "Google US English") || voices[0];
    
    synthRef.current.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    hasSynthesisSupport: !!(typeof window !== 'undefined' && 'speechSynthesis' in window),
  };
};
