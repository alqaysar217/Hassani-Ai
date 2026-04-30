'use server';
/**
 * @fileOverview توليد مخططات Mermaid باستخدام OpenRouter.
 */

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function generateDiagram(input: { description: string, diagramType: string }) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY.trim()}`,
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
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    }
    throw new Error(data.error?.message || "فشل في توليد المخطط");
  } catch (error: any) {
    throw new Error("خطأ في توليد المخطط: " + error.message);
  }
}
