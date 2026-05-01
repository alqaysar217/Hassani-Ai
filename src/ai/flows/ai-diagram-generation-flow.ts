'use server';
/**
 * @fileOverview توليد مخططات Mermaid باستخدام المفتاح المحدث.
 */

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function generateDiagram(input: { description: string, diagramType: string }) {
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
            content: `أنت خبير مخططات Mermaid. قم بتوليد مخطط ${input.diagramType} للوصف التالي.
            أرجع النتيجة بصيغة JSON فقط:
            { "diagramSyntax": "كود mermaid هنا", "diagramExplanation": "شرح موجز بالعربية للمخطط" }`
          },
          { role: 'user', content: input.description }
        ],
        response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(20000)
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    }
    throw new Error("فشل في توليد المخطط");
  } catch (error: any) {
    throw new Error("خطأ في توليد المخطط: " + error.message);
  }
}