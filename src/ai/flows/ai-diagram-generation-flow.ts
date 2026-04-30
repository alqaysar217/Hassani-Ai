'use server';
/**
 * @fileOverview A Genkit flow for generating diagrams.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDiagramInputSchema = z.object({
  description: z.string().describe('Description of the system or process.'),
  diagramType: z.enum(['useCase', 'erd', 'dfd']).describe('Type of diagram.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  diagramSyntax: z.string().describe('The generated Mermaid syntax.'),
  diagramExplanation: z.string().optional().describe('Explanation for the diagram.'),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

const aiDiagramGenerationPrompt = ai.definePrompt({
  name: 'aiDiagramGenerationPrompt',
  input: { schema: GenerateDiagramInputSchema },
  output: { schema: GenerateDiagramOutputSchema },
  prompt: `You are an expert diagram generator using Mermaid syntax.

Generate a {{{diagramType}}} diagram for this description:
{{{description}}}

Provide valid Mermaid code and a brief explanation.`,
});

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  const { output } = await aiDiagramGenerationPrompt(input);
  if (!output) throw new Error('Failed to generate diagram');
  return output;
}
