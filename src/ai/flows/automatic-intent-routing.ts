'use server';
/**
 * @fileOverview يكتشف نية المستخدم باستخدام Genkit لضمان التجاوب الفوري.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AutomaticIntentRoutingOutputSchema = z.object({
  intent: z
    .enum(['question', 'image', 'music', 'programming', 'diagram', 'planning'])
    .describe('النية المكتشفة من طلب المستخدم.'),
});
export type AutomaticIntentRoutingOutput = z.infer<typeof AutomaticIntentRoutingOutputSchema>;

export async function automaticIntentRouting(
  input: { query: string },
): Promise<AutomaticIntentRoutingOutput> {
  return automaticIntentRoutingFlow(input);
}

const automaticIntentRoutingFlow = ai.defineFlow(
  {
    name: 'automaticIntentRoutingFlow',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: AutomaticIntentRoutingOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `صنف طلب المستخدم التالي إلى واحد من هذه التصنيفات حصراً:
      - 'question': أسئلة عامة أو دردشة.
      - 'image': طلبات توليد أو تعديل صور.
      - 'music': طلبات متعلقة بالموسيقى أو الألحان.
      - 'programming': مساعدة برمجية أو إصلاح أكواد.
      - 'diagram': طلب مخططات (ERD, DFD, Use Case).
      - 'planning': تخطيط أنظمة أو قواعد بيانات.
      
      طلب المستخدم: ${input.query}`,
      output: { schema: AutomaticIntentRoutingOutputSchema }
    });

    return output || { intent: 'question' };
  }
);
