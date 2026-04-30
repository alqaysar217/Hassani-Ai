'use server';
/**
 * @fileOverview مساعد برمج مخصص يستخدم OpenRouter.
 */

import { z } from 'genkit';

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function aiCodeAssistance(input: { codeRequest: string }) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `أنت حساني، خبير برمجيات. قدم الكود والشرح بصيغة JSON:
            { "code": "markdown_code", "explanation": "شرح باللغة العربية" }`
          },
          { role: 'user', content: input.codeRequest }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    throw new Error("فشل في توليد المساعدة البرمجية عبر OpenRouter");
  }
}
