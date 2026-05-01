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
            مهمتك: تقديم الكود والشرح باللغة العربية.
            يجب أن يكون الرد بصيغة JSON حصراً كالتالي:
            { 
              "code": "ضع كود البرمجة هنا فقط بدون أي نص إضافي"، 
              "explanation": "اشرح الكود هنا باختصار وباللغة العربية مع الإشارة لهوية المطور محمود الحساني" 
            }
            ملاحظة: لا تضع علامات Markdown للكود داخل حقل الـ "code".`
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
        // إذا فشل الـ JSON، نحاول استخراج الكود يدوياً من النص
        const codeMatch = content.match(/```(?:\w+)?\n([\s\S]*?)```/) || content.match(/`([\s\S]*?)`/);
        const code = codeMatch ? codeMatch[1].trim() : "";
        const explanation = content.replace(/```[\s\S]*?```/g, "").replace(/`[\s\S]*?`/g, "").trim();
        return { 
          code: code, 
          explanation: explanation || "تفضل، هذا هو الكود الذي طلبته."
        };
      }
    }
    throw new Error("فشل في الحصول على استجابة من المحرك");
  } catch (error: any) {
    return { code: "", explanation: "عذراً، حدث خطأ أثناء معالجة الكود: " + error.message };
  }
}
