
'use server';
/**
 * @fileOverview يكتشف هذا التدفق نية المستخدم باستخدام OpenRouter.
 */

import { z } from 'genkit';

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

const AutomaticIntentRoutingOutputSchema = z.object({
  intent: z
    .enum(['question', 'image', 'music', 'programming', 'diagram', 'planning'])
    .describe('النية المكتشفة من طلب المستخدم.'),
});
export type AutomaticIntentRoutingOutput = z.infer<typeof AutomaticIntentRoutingOutputSchema>;

export async function automaticIntentRouting(
  input: { query: string },
): Promise<AutomaticIntentRoutingOutput> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hassani-ai.web.app',
        'X-Title': 'Hassani AI'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `صنف طلب المستخدم إلى واحد من هذه التصنيفات حصراً وارجع النتيجة بصيغة JSON:
            { "intent": "التصنيف" }
            التصنيفات:
            - 'question': أسئلة عامة.
            - 'image': طلبات توليد صور.
            - 'music': طلبات موسيقى.
            - 'programming': مساعدة برمجية.
            - 'diagram': مخططات.
            - 'planning': تخطيط واستراتيجية.`
          },
          { role: 'user', content: input.query }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) return { intent: 'question' };

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const result = JSON.parse(data.choices[0].message.content);
      return { intent: result.intent || 'question' };
    }
    return { intent: 'question' };
  } catch (error) {
    return { intent: 'question' };
  }
}
