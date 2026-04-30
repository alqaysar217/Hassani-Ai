'use server';
/**
 * @fileOverview This flow automatically detects the user's intent based on their query.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutomaticIntentRoutingInputSchema = z.object({
  query: z.string().describe('The user\'s query.'),
});
export type AutomaticIntentRoutingInput = z.infer<typeof AutomaticIntentRoutingInputSchema>;

const AutomaticIntentRoutingOutputSchema = z.object({
  intent: z
    .enum(['question', 'image', 'music', 'programming', 'diagram', 'planning'])
    .describe('The detected intent of the user\'s query.'),
});
export type AutomaticIntentRoutingOutput = z.infer<typeof AutomaticIntentRoutingOutputSchema>;

const automaticIntentRoutingPrompt = ai.definePrompt({
  name: 'automaticIntentRoutingPrompt',
  input: { schema: AutomaticIntentRoutingInputSchema },
  output: { schema: AutomaticIntentRoutingOutputSchema },
  prompt: `You are an AI intent detection system. Classify the user's query into one of these categories:
- 'question': General questions or seeking information.
- 'image': Requests to generate or visualize images.
- 'music': Requests to create or generate music or melodies.
- 'programming': Help with code, debugging, or programming concepts.
- 'diagram': Requests for structured diagrams (ERD, DFD, Use Case).
- 'planning': Assistance with planning, strategy, or decision-making.

User Query: {{{query}}}`,
});

export async function automaticIntentRouting(
  input: AutomaticIntentRoutingInput,
): Promise<AutomaticIntentRoutingOutput> {
  const { output } = await automaticIntentRoutingPrompt(input);
  if (!output) throw new Error('Failed to detect intent');
  return output;
}
