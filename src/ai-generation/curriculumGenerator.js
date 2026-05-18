/**
 * Edaad AI - Curriculum & Lesson Index Generation Agent
 * Designed for Google for Startups AI Challenge
 */

import { invokeEdaadAgent } from '../ai-integration/geminiClient.js';
import { Type } from '@google/genai';

/**
 * Generates a structured course index and syllabus based on a textbook topic or source text.
 * Localizes content automatically based on Saudi Vision 2030 values if applicable.
 * 
 * @param {string} courseTitle - The topic or textbook title
 * @param {string} sourceContent - Extracted raw text from uploaded PDF
 * @param {string} language - Target language (e.g. 'Arabic')
 * @returns {Promise<object>} Generated curriculum syllabus JSON
 */
export async function generateCourseStructure(courseTitle, sourceContent, language = 'Arabic') {
  const prompt = `
    You are Socrates-Edaad, an expert curriculum designer and AI Agent.
    Task: Generate a JSON course structure for "${courseTitle}".
    Language: ${language}.
    
    **SAUDI LOCALIZATION INSTRUCTIONS**:
    - Align the curriculum structure with Saudi Vision 2030 educational values.
    - Use regional case studies (e.g., NEOM futuristic city, Saudi Tourism, Aramco sustainable energy) where pedagogically appropriate.
    - Ensure a highly logical instructional design index for middle/high school levels.
    
    Source Material Reference: ${sourceContent.slice(0, 4000)}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Course title in Arabic' },
      description: { type: Type.STRING, description: 'Course summary/goals in Arabic' },
      modules: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Module name' },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Lesson Title' },
                  summary: { type: Type.STRING, description: 'Short summary of pedagogical goal' }
                }
              }
            }
          },
          required: ['title', 'lessons']
        }
      }
    },
    required: ['title', 'description', 'modules']
  };

  return await invokeEdaadAgent(prompt, `Generate full syllabus for: ${courseTitle}`, schema);
}
