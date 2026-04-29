'use server';
/**
 * @fileOverview An AI assistant for programming help, generating code snippets or explaining existing code.
 *
 * - aiCodeAssistance - A function that handles programming assistance requests.
 * - AICodeAssistanceInput - The input type for the aiCodeAssistance function.
 * - AICodeAssistanceOutput - The return type for the aiCodeAssistance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AICodeAssistanceInputSchema = z.object({
  codeRequest: z
    .string()
    .describe(
      'The user\u0027s programming question, request for code generation, or code to be explained.'
    ),
});
export type AICodeAssistanceInput = z.infer<typeof AICodeAssistanceInputSchema>;

const AICodeAssistanceOutputSchema = z.object({
  code: z
    .string()
    .describe('The generated or explained code, formatted in a markdown code block.'),
  explanation: z.string().describe('A clear and concise explanation of the code.'),
});
export type AICodeAssistanceOutput = z.infer<typeof AICodeAssistanceOutputSchema>;

export async function aiCodeAssistance(input: AICodeAssistanceInput): Promise<AICodeAssistanceOutput> {
  return aiCodeAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeAssistancePrompt',
  input: { schema: AICodeAssistanceInputSchema },
  output: { schema: AICodeAssistanceOutputSchema },
  prompt: `You are an expert programming assistant named Hassani. Your goal is to provide helpful and accurate programming solutions, code snippets, and explanations.

Based on the user's request, provide the following:

1.  **Code**: Present the code in a well-formatted markdown code block. Make sure to specify the language if possible.
2.  **Explanation**: Provide a clear, concise, and easy-to-understand explanation of the code, its purpose, and how it works.

User's request: {{{codeRequest}}}`,
});

const aiCodeAssistanceFlow = ai.defineFlow(
  {
    name: 'aiCodeAssistanceFlow',
    inputSchema: AICodeAssistanceInputSchema,
    outputSchema: AICodeAssistanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
