import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import axios from 'axios';
import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from './constants.js';

const app = express();

// Use body-parser with a verify function to get the raw body for signature validation
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const {
  WHATSAPP_TOKEN,
  VERIFY_TOKEN,
  META_APP_SECRET,
  GOOGLE_API_KEY,
  PORT = 8080
} = process.env;

// --- Initialize Gemini AI ---
if (!GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable not set.");
}
const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });

// --- Helper Functions ---

/**
 * Gets a response from the Gemini API.
 * @param {string} userMessage The message from the user.
 * @returns {Promise<string>} The AI-generated response.
 */
async function getGeminiResponse(userMessage) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
}

/**
 * Sends a message back to the user via the WhatsApp Cloud API.
 * @param {string} to The recipient's phone number.
 * @param {string} text The message text to send.
 */
async function sendWhatsAppMessage(to, text) {
  try {
    await axios.post(`https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      messaging_product: "whatsapp",
      to: to,
      text: { body: text },
    }, {
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` },
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error.response ? error.response.data : error.message);
  }
}

// --- Webhook Security Middleware ---
const verifyRequestSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    // In development, you might want to bypass this for testing
    // if (process.env.NODE_ENV === 'development') return next();
    return res.status(401).send('Signature required.');
  }
  const hash = crypto.createHmac('sha256', META_APP_SECRET).update(req.rawBody).digest('hex');
  if (crypto.timingSafeEqual(Buffer.from(`sha256=${hash}`), Buffer.from(signature))) {
    return next();
  }
  return res.status(401).send('Invalid signature.');
};

// --- Webhook Routes ---

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('IIBS AI Career Counselor WhatsApp Webhook is running.');
});


// Handles webhook verification from Meta
app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Webhook verification failed.");
    res.sendStatus(403);
  }
});

// Handles incoming messages from users
app.post('/webhook', verifyRequestSignature, (req, res) => {
  // Acknowledge the request immediately to prevent Meta from retrying
  res.sendStatus(200);

  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message && message.type === 'text') {
    const from = message.from;
    const userMessage = message.text.body;
    
    console.log(`[${new Date().toISOString()}] Received message from ${from}`);
    
    // Process the message asynchronously
    (async () => {
      try {
        const aiResponse = await getGeminiResponse(userMessage);
        await sendWhatsAppMessage(from, aiResponse);
      } catch(error) {
        console.error(`[${new Date().toISOString()}] Failed to process message for ${from}:`, error);
        await sendWhatsAppMessage(from, "I'm sorry, I encountered an issue while processing your request. Please try again in a moment.");
      }
    })();

  } else if (message) {
    console.log(`[${new Date().toISOString()}] Received non-text message type '${message.type}' from ${message.from}`);
  }
});

app.listen(PORT, () => console.log(`WhatsApp webhook server is listening on port ${PORT}`));