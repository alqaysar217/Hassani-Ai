'use server';
/**
 * @fileOverview توليد مخططات Mermaid باستخدام OpenRouter.
 */

import { z } from 'genkit';

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function generateDiagram(input: { description: string, diagramType: string }) {
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
            content: `أنت خبير مخططات Mermaid. قم بتوليد مخطط ${input.diagramType} للوصف التالي.
            أرجع النتيجة بصيغة JSON فقط:
            { "diagramSyntax": "mermaid_code", "diagramExplanation": "شرح موجز بالعربية" }`
          },
          { role: 'user', content: input.description }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    throw new Error("فشل في توليد المخطط عبر OpenRouter");
  }
}
