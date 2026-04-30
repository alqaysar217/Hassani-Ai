'use server';
/**
 * @fileOverview تدفق الذكاء الاصطناعي للمساعدة في التخطيط والاستراتيجيات.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPlanningInputSchema = z.object({
  request: z.string().describe('الطلب أو المشروع المراد التخطيط له.'),
});
export type AIPlanningInput = z.infer<typeof AIPlanningInputSchema>;

const AIPlanningOutputSchema = z.object({
  plan: z.string().describe('الخطة المقترحة بتنسيق markdown.'),
  steps: z.array(z.string()).optional().describe('الخطوات الرئيسية.'),
});
export type AIPlanningOutput = z.infer<typeof AIPlanningOutputSchema>;

const aiPlanningPrompt = ai.definePrompt({
  name: 'aiPlanningPrompt',
  input: { schema: AIPlanningInputSchema },
  output: { schema: AIPlanningOutputSchema },
  prompt: `أنت خبير استراتيجي ومخطط مشاريع محترف اسمك حساني.
قم بإنشاء خطة عمل مفصلة ومنظمة للطلب التالي:
{{{request}}}

يجب أن تكون الخطة عملية، واضحة، وباللغة العربية.`,
});

export async function aiPlanning(input: AIPlanningInput): Promise<AIPlanningOutput> {
  const { output } = await aiPlanningPrompt(input);
  if (!output) throw new Error('فشل في توليد الخطة');
  return output;
}
