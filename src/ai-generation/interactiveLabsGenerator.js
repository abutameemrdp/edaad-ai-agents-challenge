/**
 * Edaad AI - Gamified Virtual Labs & Escape Rooms Synthesizer Agent
 * Designed for Google for Startups AI Challenge
 */

import { invokeEdaadAgent } from '../ai-integration/geminiClient.js';
import { Type } from '@google/genai';

/**
 * Synthesizes a Saudi-inspired gamified "Escape Room" learning scenario.
 * 
 * @param {string} topic - The science/history topic
 * @param {string} sourceText - Technical concepts textbook reference
 * @returns {Promise<object>} Generated immersive game layout JSON
 */
export async function generateEscapeRoomScenario(topic, sourceText) {
  const prompt = `
    You are Socrates-Edaad, an expert immersive game designer.
    Create a highly interactive educational "Escape Room" game scenario based on: "${topic}".
    
    **THEMATIC LOCALIZATION (SAUDI)**:
    - Incorporate Saudi-inspired visual themes (e.g., A futuristic laboratory in NEOM, an ancient astronomical observatory in Al-Ula, or a digital banking vault in Riyadh).
    - The narrative should use an elegant, adventurous, yet culturally respectful tone in Arabic.
    
    Syllabus Context: ${sourceText.slice(0, 3000)}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      scenario: { type: Type.STRING, description: 'Introductory story in Arabic explaining the quest.' },
      theme: { type: Type.STRING, description: 'Visual style descriptor (e.g. NEOM-Sci-Fi, Nabataean-Archeology)' },
      rooms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Arabic name of the level/room' },
            challenge: { type: Type.STRING, description: 'Conceptual puzzle or scientific riddle the student must solve' },
            answer: { type: Type.STRING, description: 'The exact keyword required to unlock this room' }
          },
          required: ['name', 'challenge', 'answer']
        }
      }
    },
    required: ['scenario', 'theme', 'rooms']
  };

  return await invokeEdaadAgent(prompt, `Generate Saudi-Themed Escape Room for: ${topic}`, schema);
}
