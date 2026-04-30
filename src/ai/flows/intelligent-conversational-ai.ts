'use server';
/**
 * @fileOverview استخدام OpenRouter كمحرك أساسي للذكاء الاصطناعي.
 */

import { z } from 'genkit';

const IntelligentConversationalAiInputSchema = z.object({
  query: z.string().describe('سؤال المستخدم أو طلبه.'),
  imageHeader: z.string().optional().describe('بيانات الصورة بتنسيق base64 (اختياري).'),
});
export type IntelligentConversationalAiInput = z.infer<typeof IntelligentConversationalAiInputSchema>;

const IntelligentConversationalAiOutputSchema = z.object({
  response: z.string().describe('رد المساعد الذكي.'),
});
export type IntelligentConversationalAiOutput = z.infer<typeof IntelligentConversationalAiOutputSchema>;

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function intelligentConversationalAi(
  input: IntelligentConversationalAiInput
): Promise<IntelligentConversationalAiOutput> {
  try {
    const contentPayload: any[] = [];
    
    if (input.query) {
      contentPayload.push({ type: 'text', text: input.query });
    }
    
    if (input.imageHeader) {
      contentPayload.push({
        type: 'image_url',
        image_url: { url: input.imageHeader }
      });
    }

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
        messages: [{ role: 'user', content: contentPayload }]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return { response: data.choices[0].message.content };
    } else if (data.error) {
      if (data.error.message.includes("User not found") || data.error.message.includes("API key")) {
        return { response: "خطأ في الاتصال: يبدو أن هناك مشكلة في مفتاح OpenRouter أو الرصيد. يرجى مراجعة حسابك." };
      }
      throw new Error(data.error.message);
    } else {
      throw new Error("فشل الاتصال بمحرك OpenRouter");
    }
  } catch (error: any) {
    return { response: "عذراً، حدث خطأ في الاتصال: " + error.message };
  }
}
