'use server';
/**
 * @fileOverview An AI assistant for programming help.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AICodeAssistanceInputSchema = z.object({
  codeRequest: z.string().describe('The programming question or request.'),
});
export type AICodeAssistanceInput = z.infer<typeof AICodeAssistanceInputSchema>;

const AICodeAssistanceOutputSchema = z.object({
  code: z.string().describe('The generated code in a markdown block.'),
  explanation: z.string().describe('Explanation of the code.'),
});
export type AICodeAssistanceOutput = z.infer<typeof AICodeAssistanceOutputSchema>;

const aiCodeAssistancePrompt = ai.definePrompt({
  name: 'aiCodeAssistancePrompt',
  input: { schema: AICodeAssistanceInputSchema },
  output: { schema: AICodeAssistanceOutputSchema },
  prompt: `You are an expert programming assistant named Hassani. Provide code and a clear explanation.

User's request: {{{codeRequest}}}`,
});

export async function aiCodeAssistance(input: AICodeAssistanceInput): Promise<AICodeAssistanceOutput> {
  const { output } = await aiCodeAssistancePrompt(input);
  if (!output) throw new Error('Failed to generate code assistance');
  return output;
}
