'use server';
/**
 * @fileOverview A Genkit flow for generating structured diagram syntax (e.g., Mermaid) from a text description.
 *
 * - generateDiagram - A function that handles the diagram generation process.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The return type for the generateDiagram function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDiagramInputSchema = z.object({
  description: z.string().describe('A detailed description of the system or process for which a diagram needs to be generated.'),
  diagramType: z.enum(['useCase', 'erd', 'dfd']).describe('The type of diagram to generate (e.g., useCase, erd, dfd).'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  diagramSyntax: z.string().describe('The generated diagram syntax, preferably in Mermaid format.'),
  diagramExplanation: z.string().optional().describe('An optional explanation or context for the generated diagram.'),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  return aiDiagramGenerationFlow(input);
}

const aiDiagramGenerationPrompt = ai.definePrompt({
  name: 'aiDiagramGenerationPrompt',
  input: { schema: GenerateDiagramInputSchema },
  output: { schema: GenerateDiagramOutputSchema },
  prompt: `You are an expert diagram generator. Your task is to convert a user's description into structured diagram syntax. Focus on clarity, accuracy, and adherence to the specified diagram type's conventions.

Use Mermaid syntax for all diagrams. For example, for a Use Case diagram, use 'graph TD' or 'sequenceDiagram'. For an ERD, use 'erDiagram'. For a DFD, use 'graph TD' with appropriate node shapes and links.

Generate the diagram syntax for a {{{diagramType}}} diagram based on the following description:

Description: {{{description}}}

When generating the diagramSyntax, ensure it is a complete and valid Mermaid syntax block. Do not include any introductory or concluding text outside of the Mermaid block itself. If an explanation is beneficial, provide it in the diagramExplanation field.

mermaid

`,
});

const aiDiagramGenerationFlow = ai.defineFlow(
  {
    name: 'aiDiagramGenerationFlow',
    inputSchema: GenerateDiagramInputSchema,
    outputSchema: GenerateDiagramOutputSchema,
  },
  async (input) => {
    const { output } = await aiDiagramGenerationPrompt(input);
    return output!;
  }
);
