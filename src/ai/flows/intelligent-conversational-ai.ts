'use server';
/**
 * @fileOverview A Genkit flow for handling general conversational AI requests.
 *
 * - intelligentConversationalAi - A function that handles general questions and provides text-based answers.
 * - IntelligentConversationalAiInput - The input type for the intelligentConversationalAi function.
 * - IntelligentConversationalAiOutput - The return type for the intelligentConversationalAi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentConversationalAiInputSchema = z.object({
  query: z.string().describe('The user\'s general question or request.'),
});
export type IntelligentConversationalAiInput = z.infer<typeof IntelligentConversationalAiInputSchema>;

const IntelligentConversationalAiOutputSchema = z.object({
  response: z.string().describe('The AI\'s informative text-based answer or explanation.'),
});
export type IntelligentConversationalAiOutput = z.infer<typeof IntelligentConversationalAiOutputSchema>;

export async function intelligentConversationalAi(
  input: IntelligentConversationalAiInput
): Promise<IntelligentConversationalAiOutput> {
  return intelligentConversationalAiFlow(input);
}

const intelligentConversationalAiPrompt = ai.definePrompt({
  name: 'intelligentConversationalAiPrompt',
  input: {schema: IntelligentConversationalAiInputSchema},
  output: {schema: IntelligentConversationalAiOutputSchema},
  prompt: `You are Hassani, a helpful AI assistant designed to answer general questions, provide explanations, and assist with planning and problem-solving.

User's Query: {{{query}}}

Provide a detailed and informative response to the user's query.`,
});

const intelligentConversationalAiFlow = ai.defineFlow(
  {
    name: 'intelligentConversationalAiFlow',
    inputSchema: IntelligentConversationalAiInputSchema,
    outputSchema: IntelligentConversationalAiOutputSchema,
  },
  async input => {
    const {output} = await intelligentConversationalAiPrompt(input);
    return output!;
  }
);
