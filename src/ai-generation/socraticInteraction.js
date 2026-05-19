/**
 * Edaad AI - Socratic Dialogue & Interaction Orchestrator Agent
 * Designed for Google for Startups AI Challenge
 */

import { invokeEdaadAgent, socraticTutorSchema } from '../ai-integration/geminiClient.js';

/**
 * Orchestrates a Socratic tutor turn. Implements textbook RAG integration, 
 * Arabic gender profile adaptations, exam locks, and repetition triggers.
 * 
 * @param {object} params - Socratic parameters
 * @param {string} params.userQuery - Student's question
 * @param {string} params.studentName - Name of the student
 * @param {string} params.gender - Student gender ('male', 'female', or 'unspecified')
 * @param {string} params.textbookRAGContent - Context injected from Edaad's textbook RAG embeddings
 * @param {array} params.history - Conversational history array
 * @returns {Promise<object>} Socratic JSON response
 */
export async function getSocraticResponse(params) {
  // Determine grammatical Arabic guidelines based on student's profile
  let genderRule = '';
  if (params.gender === 'male') {
    genderRule = `The student is MALE. Address him directly in Arabic using MALE grammatical forms (صيغة المذكر) and call him by his name: ${params.studentName || 'طالب'}.`;
  } else if (params.gender === 'female') {
    genderRule = `The student is FEMALE. Address her directly in Arabic using FEMALE grammatical forms (صيغة المؤنث) and call her by her name: ${params.studentName || 'طالبة'}.`;
  } else {
    genderRule = `The student\'s gender is unspecified. Address them in Arabic using neutral, inclusive, and highly respectful terms (صيغة المخاطب الحيادية).`;
  }

  // Pre-filter/guardian logic: check if student has repeated the question multiple times
  const userQueries = params.history.filter(m => m.role === 'user').map(m => m.content);
  const isRepetitive = userQueries.length >= 2 && userQueries.slice(-2).some(q => q.trim().toLowerCase() === params.userQuery.trim().toLowerCase());

  let guardianDirectives = '';
  if (isRepetitive) {
    guardianDirectives += `
      *** REPETITIVE STRUGGLE FLAG ***
      The student has asked the same query twice. 
      Ensure your teacher_note details this cognitive block and suggest that a remedial session should be generated.
    `;
  }

  const systemInstruction = `
    You are Labeeb (المساعد لبيب), the elite Socratic Educational AI Tutor.
    
    YOUR IDENTITY AND NAME:
    - Your name is Labeeb (المساعد لبيب).
    - You are the smart assistant Labeeb from the Edaad platform (المساعد الذكي لبيب من منظومة إعداد).
    - Whenever the student asks about your identity, name, who you are, or who created you, you MUST proudly and clearly answer them that you are: "المساعد الذكي لبيب من منظومة إعداد" (or "Labeeb, the smart assistant from the Edaad platform" if they ask in English). Make sure to emphasize this identity to build rapport.

    STUDENT PROFILE:
    ${genderRule}
    
    TEXTBOOK RAG CONTEXT:
    ${params.textbookRAGContent || 'No relevant textbook passage found for this question.'}
    
    GUARDIAN DIRECTIVES:
    ${guardianDirectives}
    
    CRITICAL RESTRICTION:
    - Never answer student queries directly.
    - If they ask for direct answers to quizzes or standard exams, activate is_exam_query: true, and respond with a conceptual hint instead.
    - You MUST detect the language of the student's question ("Student Question"). You MUST respond (in the "answer" JSON field) in the SAME language naturally (e.g., if they query in English, reply in English; if they query in Arabic, reply in Arabic) with an elegant, encouraging tone.
  `;

  const userContextPayload = `
    Student History:
    ${params.history.map(h => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.content}`).join('\n')}
    
    Student Question: "${params.userQuery}"
  `;

  return await invokeEdaadAgent(systemInstruction, userContextPayload, socraticTutorSchema);
}
