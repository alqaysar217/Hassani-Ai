'use server';
/**
 * @fileOverview مساعد برمج مخصص يستخدم OpenRouter مع هوية حساني.
 */

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function aiCodeAssistance(input: { codeRequest: string }) {
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
            content: `أنت "حساني"، خبير برمجيات محترف تم تطويرك وتخصيصك بواسطة المهندس محمود الحساني.
            مهمتك: تقديم الكود والشرح باللغة العربية حصراً وبصيغة JSON واضحة.
            يجب أن يكون الرد كالتالي:
            { 
              "code": "كود البرمجة هنا"، 
              "explanation": "شرح الكود باللغة العربية مع الإشارة لهوية المطور محمود الحساني" 
            }`
          },
          { role: 'user', content: input.codeRequest }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      try {
        const parsed = JSON.parse(content);
        return {
          code: parsed.code || "",
          explanation: parsed.explanation || "تفضل، هذا هو الكود المطلوب."
        };
      } catch (e) {
        // في حال فشل الـ JSON، نرجع النص كاملاً كشرح
        return { code: "", explanation: content };
      }
    }
    throw new Error(data.error?.message || "فشل في توليد المساعدة البرمجية");
  } catch (error: any) {
    throw new Error("خطأ في الاتصال بالمساعد البرمجي: " + error.message);
  }
}
