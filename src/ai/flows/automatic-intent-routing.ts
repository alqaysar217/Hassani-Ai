'use server';
/**
 * @fileOverview This flow automatically detects the user's intent based on their query
 * and classifies it into predefined categories.
 *
 * - automaticIntentRouting - A function that detects the intent of a user's query.
 * - AutomaticIntentRoutingInput - The input type for the automaticIntentRouting function.
 * - AutomaticIntentRoutingOutput - The return type for the automaticIntentRouting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutomaticIntentRoutingInputSchema = z.object({
  query: z.string().describe('The user\'s query for which to detect the intent.'),
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
  prompt: `You are an AI intent detection system. Your task is to classify a user's query into one of the following categories:
- 'question': The user is asking a general question, seeking information, or engaging in general conversation.
- 'image': The user explicitly asks to generate an image or describes something they want to visualize.
- 'music': The user asks to create or generate music, a song, or a melody.
- 'programming': The user is asking for help with code, programming concepts, debugging, or code generation.
- 'diagram': The user asks to generate a diagram (e.g., Use Case, ERD, DFD) or describes a system they want to visualize structurally.
- 'planning': The user is seeking assistance with planning, problem-solving, strategizing, or making decisions.

Analyze the following user query and respond ONLY with a JSON object containing a single 'intent' field, matching one of the categories above. Do not include any other text or explanation.

User Query: "{{{query}}}"`,
});

const automaticIntentRoutingFlow = ai.defineFlow(
  {
    name: 'automaticIntentRoutingFlow',
    inputSchema: AutomaticIntentRoutingInputSchema,
    outputSchema: AutomaticIntentRoutingOutputSchema,
  },
  async (input) => {
    const { output } = await automaticIntentRoutingPrompt(input);
    return output!;
  },
);

export async function automaticIntentRouting(
  input: AutomaticIntentRoutingInput,
): Promise<AutomaticIntentRoutingOutput> {
  return automaticIntentRoutingFlow(input);
}
