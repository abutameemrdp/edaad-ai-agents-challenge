/**
 * Edaad AI - Remedial Content & Assessment Generator Agent
 * Designed for Google for Startups AI Challenge
 */

import { invokeEdaadAgent } from '../ai-integration/geminiClient.js';
import { Type } from '@google/genai';

/**
 * Generates high-fidelity HTML remedial lesson content and assessment questions.
 * 
 * @param {string} conceptGap - The diagnosed concept struggle
 * @param {string} language - Target language (e.g. 'Arabic')
 * @returns {Promise<object>} Generated remedial lesson with nested assessment questions JSON
 */
export async function generateRemedialLessonContent(conceptGap, language = 'Arabic') {
  const prompt = `
    You are Socrates-Edaad, an expert Remedial AI Teacher.
    The student has been diagnosed with a critical learning gap in: "${conceptGap}".
    
    Task: Create a comprehensive, friendly, and visually structured HTML remedial lesson.
    
    Rules for output format:
    1. Use h3 elements for subheadings.
    2. Enclose golden key tips in: <blockquote class="blockquote-idea">.
    3. Enclose critical warnings in: <blockquote class="blockquote-info">.
    4. Provide 3 check-for-understanding quiz questions enclosed in <blockquote class="blockquote-question">.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: {
        type: Type.OBJECT,
        properties: { ar: { type: Type.STRING }, en: { type: Type.STRING } },
        required: ['ar', 'en']
      },
      content: {
        type: Type.OBJECT,
        properties: { ar: { type: Type.STRING }, en: { type: Type.STRING } },
        required: ['ar', 'en']
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            choices: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING }
          }
        }
      }
    },
    required: ['id', 'title', 'content', 'questions']
  };

  return await invokeEdaadAgent(prompt, `Generate full remedial module for gap: ${conceptGap}`, schema);
}
