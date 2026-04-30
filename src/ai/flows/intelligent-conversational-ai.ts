'use server';
/**
 * @fileOverview استخدام OpenRouter كمحرك أساسي للذكاء الاصطناعي بناءً على رغبة المستخدم.
 * يتم استخدام المفتاح المرفق مباشرة لضمان العمل بدون تعقيدات.
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

// المفتاح الذي أرفقته يا محمود - يعمل مباشرة مع OpenRouter
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
        'HTTP-Referer': 'https://hassani-ai.firebaseapp.com',
        'X-Title': 'Hassani AI Assistant'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: contentPayload
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return { response: data.choices[0].message.content };
    } else {
      console.error("OpenRouter Error Data:", data);
      throw new Error(data.error?.message || "فشل في الحصول على رد من محرك OpenRouter");
    }
  } catch (error: any) {
    console.error("OpenRouter Connection Error:", error);
    return { response: "عذراً، حدث خطأ في الاتصال بمحرك OpenRouter: " + error.message };
  }
}
