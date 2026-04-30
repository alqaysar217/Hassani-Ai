
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// سيقوم Genkit تلقائياً بالبحث عن GOOGLE_GENAI_API_KEY أو GEMINI_API_KEY في ملف .env
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
