'use server';
/**
 * @fileOverview خبير استراتيجي يستخدم Genkit للتخطيط مع هوية حساني الكاملة.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPlanningOutputSchema = z.object({
  plan: z.string().describe('النص الكامل للخطة بصيغة markdown.'),
  steps: z.array(z.string()).describe('خطوات التنفيذ.'),
});

export async function aiPlanning(input: { request: string }) {
  const { output } = await ai.generate({
    system: `أنت "حساني"، خبير استراتيجي ومخطط أعمال مطور بواسطة المهندس محمود الحساني. 
    أنشئ خطة مفصلة واحترافية باللغة العربية. تحدث بصفتك حساني، المساعد الذكي المطور من محمود الحساني ورئيس فريق MW Soft.`,
    prompt: input.request,
    output: { schema: AiPlanningOutputSchema }
  });
  return output;
}
