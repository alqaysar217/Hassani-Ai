'use server';
/**
 * @fileOverview Genkit flow adapted to use OpenRouter API for more reliable connectivity.
 */

import { z } from 'genkit';

const IntelligentConversationalAiInputSchema = z.object({
  query: z.string().describe('The user\'s question or request.'),
  imageHeader: z.string().optional().describe('Optional base64 image data.'),
});
export type IntelligentConversationalAiInput = z.infer<typeof IntelligentConversationalAiInputSchema>;

const IntelligentConversationalAiOutputSchema = z.object({
  response: z.string().describe('The AI\'s text-based answer.'),
});
export type IntelligentConversationalAiOutput = z.infer<typeof IntelligentConversationalAiOutputSchema>;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
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
      throw new Error(data.error?.message || "فشل في الحصول على رد من OpenRouter");
    }
  } catch (error: any) {
    console.error("OpenRouter Error:", error);
    return { response: "عذراً، حدث خطأ في الاتصال بالمحرك: " + error.message };
  }
}
