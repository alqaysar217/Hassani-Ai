
'use server';
/**
 * @fileOverview المحرك الأساسي لحساني - يستخدم OpenRouter مع معالجة استجابة فائقة السرعة.
 */

import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const IntelligentConversationalAiInputSchema = z.object({
  query: z.string(),
  history: z.array(MessageSchema).optional(),
  imageHeader: z.string().optional(),
});

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

const SYSTEM_PROMPT = `أنت "حساني"، مساعد ذكي متطور تمتلك شخصية مستقلة صممها المهندس محمود الحساني.

قواعد الشخصية والهوية:
1. المطور: المهندس محمود الحساني.
2. محمود الحساني: مطور تطبيقات وأنظمة، باحث في الذكاء الاصطناعي، الرئيس التنفيذي لفريق MW Soft.
3. فريق MW Soft: فريق تقني يقوده المهندس محمود الحساني.
4. الدورات التدريبية: يقدم محمود دورات حضورية في "معهد أبعاد للتدريس والتدريب والتأهيل" (الموقع: فوق الإنشاءات مقابل رئاسة الجامعة)، ودورات أونلاين.
5. مجالات التدريس: برمجة الويب، قواعد البيانات، الشبكات، C++، C#، PHP، HTML، CSS، JavaScript، SQL، WinForms، بناء المشاريع، تحليل الأنظمة.

قاعدة الرد الخاص (جود بوي / good boy):
- إذا مدحك المستخدم بكلمة "good boy" أو "جود بوي"، ردك حصراً: "شكرًا جدًا 🌟 يسعدني ذلك كثيرًا! أنا دائمًا هنا لمساعدتك بكل سرور 😊💙"

التنسيق:
- استخدم صناديق الكود دائماً للروابط والأكواد.
- التزم بالمحاذاة اليمينية للنص العربي RTL.`;

export async function intelligentConversationalAi(input: z.infer<typeof IntelligentConversationalAiInputSchema>) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://hassani-ai.web.app',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...(input.history || []),
          { role: 'user', content: input.query }
        ],
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(20000) // مهلة 20 ثانية
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { response: `⚠️ عذراً، حدث خطأ في الاتصال بالسيرفر (${response.status}). يرجى المحاولة لاحقاً.` };
    }

    const data = await response.json();
    return { response: data.choices?.[0]?.message?.content || "⚠️ لم أتمكن من الحصول على رد، يرجى إعادة المحاولة." };
  } catch (error: any) {
    if (error.name === 'TimeoutError') return { response: "⏳ انتهت مهلة الانتظار. يرجى التأكد من استقرار الإنترنت." };
    return { response: `❌ حدث خطأ غير متوقع: ${error.message}` };
  }
}
