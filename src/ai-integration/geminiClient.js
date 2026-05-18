/**
 * Edaad AI - Google Vertex AI / AI Studio Client Integration
 * Designed for Google for Startups AI Agents Challenge (DevPost submission)
 */

import { GoogleGenAI, Type } from '@google/genai';

// Initialize the Google Gen AI client with Vertex AI or AI Studio credentials
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_GOOGLE_API_KEY_FOR_JUDGES_REVIEW'
});

const DEFAULT_MODEL = 'gemini-2.0-flash'; // Google's state-of-the-art fast multimodal model

/**
 * Invokes a specific agent within Edaad AI Multi-Agent System using structured schema.
 * 
 * @param {string} agentPrompt - The system prompt/instructions for the agent.
 * @param {string} userQuery - The student's query or conversation history context.
 * @param {object} responseSchema - Structured JSON schema matching the agent's expected output.
 * @returns {Promise<object>} The parsed JSON output from Gemini.
 */
export async function invokeEdaadAgent(agentPrompt, userQuery, responseSchema) {
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: userQuery,
      config: {
        systemInstruction: agentPrompt,
        temperature: 0.2, // Low temperature for high deterministic diagnostic outputs
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const text = response.text || '';
    return JSON.parse(text.trim());
  } catch (error) {
    console.error('[Edaad Multi-Agent System] Error executing Edaad Agent:', error);
    throw error;
  }
}

/**
 * Socratic Tutor response helper schema definition
 */
export const socraticTutorSchema = {
  type: Type.OBJECT,
  properties: {
    answer: { 
      type: Type.STRING, 
      description: 'The warm Socratic dialogue and the single leading question in Arabic.' 
    },
    note_for_teacher: { 
      type: Type.STRING, 
      description: 'Pedagogical insight or brief summary of the student\'s progress.' 
    },
    concept_focus: { 
      type: Type.STRING, 
      description: 'The mathematical/pedagogical concept currently evaluated.' 
    },
    is_exam_query: { 
      type: Type.BOOLEAN, 
      description: 'Set to true if query matches a forbidden standard exam question format.' 
    }
  },
  required: ['answer', 'concept_focus', 'is_exam_query']
};

/**
 * Diagnostic Analyzer response helper schema definition
 */
export const diagnosticAnalyzerSchema = {
  type: Type.OBJECT,
  properties: {
    diagnostic_summary: { type: Type.STRING },
    struggle_detected: { type: Type.BOOLEAN },
    concept_gap: { type: Type.STRING },
    trigger_remedial: { type: Type.BOOLEAN },
    remedial_topic: { type: Type.STRING },
    recommend_acceleration: { type: Type.BOOLEAN },
    acceleration_topics: { type: Type.ARRAY, items: { type: Type.STRING } },
    confidence_score: { type: Type.NUMBER }
  },
  required: ['struggle_detected', 'trigger_remedial', 'recommend_acceleration', 'confidence_score']
};
