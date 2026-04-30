
'use server';
/**
 * @fileOverview خبير استراتيجي يستخدم OpenRouter للتخطيط.
 */

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function aiPlanning(input: { request: string }) {
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
            content: `أنت حساني، خبير استراتيجي ومخطط أعمال. أنشئ خطة مفصلة واحترافية باللغة العربية للطلب التالي.
            أرجع النتيجة بصيغة JSON:
            { "plan": "النص الكامل للخطة بصيغة markdown احترافية", "steps": ["خطوة 1", "خطوة 2"] }`
          },
          { role: 'user', content: input.request }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return JSON.parse(data.choices[0].message.content);
    }
    throw new Error(data.error?.message || "فشل في توليد الخطة");
  } catch (error: any) {
    throw new Error("خطأ في نظام التخطيط: " + error.message);
  }
}
