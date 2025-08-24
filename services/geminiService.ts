import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import type { Message } from '../types';

// Safely access the API key. In a Vite/Webpack build, `process.env.API_KEY`
// is replaced at build time. In a raw browser environment, `process` is undefined.
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY)
    ? process.env.API_KEY
    : undefined;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    // This warning is for the developer/deployer.
    console.warn(
        "Gemini API key not found. Please set the API_KEY environment variable. " +
        "The application will run in a disconnected state."
    );
}

// Export a flag to be used by the UI
export const isApiConfigured = !!ai;

export const getChatStream = async (history: Message[], newMessage:string) => {
    if (!ai) {
        throw new Error("Gemini API key not configured. The application is in a disconnected state.");
    }

    const geminiHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: geminiHistory,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });

    const result = await chat.sendMessageStream({ message: newMessage });
    return result;
};
