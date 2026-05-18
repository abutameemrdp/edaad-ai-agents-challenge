/**
 * Edaad AI - Multi-Agent Tool Integration & Function Calling
 * Demonstrates how Gemini triggers system actions based on diagnostic evaluation.
 */

import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MOCK_GOOGLE_API_KEY'
});

/**
 * Definition of the native system tools (functions) Edaad AI can execute.
 */
const triggerRemedialSupportTool = {
  name: 'triggerRemedialSupport',
  description: 'Triggers the automatic generation of a personalized remedial course segment and alerts the teacher when a conceptual struggle is diagnosed.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentId: { type: Type.STRING, description: 'The unique UUID of the student.' },
      struggleConcept: { type: Type.STRING, description: 'The concept the student is struggling with.' },
      severityLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'Diagnostic severity of learning gap.' }
    },
    required: ['studentId', 'struggleConcept', 'severityLevel']
  }
};

/**
 * Executes a chat turn with function calling capability enabled.
 * 
 * @param {string} systemPrompt - Socratic/Diagnostic agent prompt.
 * @param {string} studentMessage - The student\'s query.
 * @param {Function} executionCallback - Callback to handle Supabase notifications or Edge Function generation.
 */
export async function runSocraticDiagnosticLoop(systemPrompt, studentMessage, executionCallback) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: studentMessage,
      config: {
        systemInstruction: systemPrompt,
        // Provide the tool declaration to Gemini
        tools: [{ functionDeclarations: [triggerRemedialSupportTool] }],
        toolConfig: {
          functionCallingConfig: {
            mode: 'AUTO' // Let Gemini decide when to invoke the tools
          }
        }
      }
    });

    const functionCalls = response.functionCalls || [];
    
    if (functionCalls.length > 0) {
      for (const call of functionCalls) {
        if (call.name === 'triggerRemedialSupport') {
          console.log('[Edaad Orchestrator] Gemini triggered triggerRemedialSupport tool with args:', call.args);
          
          // Execute callback which makes Supabase DB insert / edge function call
          const executionResult = await executionCallback(call.args);
          
          // Return the tool call execution result back to Gemini to complete the loop
          return {
            toolTriggered: true,
            toolName: call.name,
            args: call.args,
            result: executionResult
          };
        }
      }
    }

    return {
      toolTriggered: false,
      textResponse: response.text
    };
  } catch (error) {
    console.error('[Edaad Orchestrator] Error in Socratic Diagnostic Loop:', error);
    throw error;
  }
}
