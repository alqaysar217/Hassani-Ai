'use server';
/**
 * @fileOverview A Genkit flow for handling general conversational AI requests.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentConversationalAiInputSchema = z.object({
  query: z.string().describe('The user\'s question or request.'),
});
export type IntelligentConversationalAiInput = z.infer<typeof IntelligentConversationalAiInputSchema>;

const IntelligentConversationalAiOutputSchema = z.object({
  response: z.string().describe('The AI\'s text-based answer.'),
});
export type IntelligentConversationalAiOutput = z.infer<typeof IntelligentConversationalAiOutputSchema>;

const intelligentConversationalAiPrompt = ai.definePrompt({
  name: 'intelligentConversationalAiPrompt',
  input: {schema: IntelligentConversationalAiInputSchema},
  output: {schema: IntelligentConversationalAiOutputSchema},
  prompt: `You are Hassani, a helpful AI assistant. Provide a detailed and informative response to the user's query.

User's Query: {{{query}}}`,
});

export async function intelligentConversationalAi(
  input: IntelligentConversationalAiInput
): Promise<IntelligentConversationalAiOutput> {
  const {output} = await intelligentConversationalAiPrompt(input);
  if (!output) throw new Error('No response from AI');
  return output;
}
