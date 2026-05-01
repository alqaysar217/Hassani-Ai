'use server';
/**
 * @fileOverview مساعد برمج مخصص يستخدم Genkit مع هوية حساني.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiCodeOutputSchema = z.object({
  code: z.string().describe('كود البرمجة فقط.'),
  explanation: z.string().describe('الشرح باللغة العربية.'),
});

export async function aiCodeAssistance(input: { codeRequest: string }) {
  const { output } = await ai.generate({
    system: `أنت "حساني"، خبير برمجيات محترف مطور بواسطة المهندس محمود الحساني. 
    قدم الحلول البرمجية والشرح باللغة العربية بأسلوب هندسي رصين.`,
    prompt: input.codeRequest,
    output: { schema: AiCodeOutputSchema }
  });
  return output || { code: "", explanation: "تفضل، هذا هو الحل البرمجي." };
}
