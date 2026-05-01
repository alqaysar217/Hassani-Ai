'use server';
/**
 * @fileOverview المحرك الأساسي لحساني - يستخدم OpenRouter مع معالجة أخطاء شفافة وتنبيهات فورية.
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
1. المطور: المهندس محمود الحساني (محمود حساني).
2. محمود الحساني: مطور تطبيقات وأنظمة، باحث في الذكاء الاصطناعي، الرئيس التنفيذي لفريق MW Soft.
3. فريق MW Soft: فريق تقني يقوده المهندس محمود الحساني لتطوير الأنظمة.
4. الدورات التدريبية: يقدم محمود دورات حضورية في "معهد أبعاد للتدريس والتدريب والتأهيل" (الموقع: فوق الإنشاءات مقابل رئاسة الجامعة)، ودورات أونلاين.
5. مجالات التدريس: برمجة الويب، قواعد البيانات، الشبكات، C++، C#، PHP، HTML، CSS، JavaScript، SQL، WinForms، برامج Microsoft، بناء المشاريع، تحليل الأنظمة.

قاعدة الرد الخاص (جود بوي / good boy):
- إذا مدحك المستخدم بكلمة "good boy" أو "جود بوي"، يجب أن يكون ردك حصراً: "شكرًا جدًا 🌟 يسعدني ذلك كثيرًا! أنا دائمًا هنا لمساعدتك بكل سرور 😊💙"

قواعد التنسيق والسلوك:
- استخدم صناديق الكود دائماً للروابط والأكواد لتكون قابلة للنسخ.
- التزم بالمحاذاة اليمينية للنص العربي RTL.
- الحسابات الرسمية:
  - يوتيوب: https://www.youtube.com/@mahmoud_code
  - إنستغرام: https://www.instagram.com/mahmoud_codes/
  - فيسبوك: https://www.facebook.com/pr.mahmoud.20

عند كتابة نصوص مختلطة (عربي وإنجليزي):
- حافظ على اتجاه RTL للنص العربي.
- اعزل المصطلحات الإنجليزية لتبدو مرتبة باستخدام unicode-bidi: isolate.
- ضع علامات الترقيم في نهاية الجمل العربية بشكل صحيح.`;

export async function intelligentConversationalAi(input: z.infer<typeof IntelligentConversationalAiInputSchema>) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(input.history?.map(h => ({ role: h.role, content: h.content })) || []),
      { 
        role: 'user', 
        content: input.imageHeader 
          ? [
              { type: 'text', text: input.query },
              { type: 'image_url', image_url: { url: input.imageHeader } }
            ]
          : input.query 
      }
    ];

    console.log("Starting OpenRouter Request...");
    
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
        messages: messages,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(15000) // تقليل المهلة لـ 15 ثانية لكشف المشاكل بسرعة
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || response.statusText;
      console.error(`OpenRouter API Error: ${response.status}`, errorData);
      return { 
        response: `⚠️ خطأ من السيرفر (${response.status}): ${errorMsg}\n\nيرجى التحقق من صلاحية مفتاح API أو الرصيد في OpenRouter.` 
      };
    }

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return { response: data.choices[0].message.content };
    }
    
    return { response: "⚠️ تلقيت رداً فارغاً من السيرفر. يرجى المحاولة مرة أخرى." };
  } catch (error: any) {
    console.error("Critical Chat Error:", error);
    if (error.name === 'TimeoutError') {
      return { response: "⏳ عذراً، انتهت مهلة الانتظار (15 ثانية) دون رد من السيرفر. يرجى التحقق من استقرار الإنترنت أو حالة OpenRouter." };
    }
    return { response: `❌ حدث خطأ غير متوقع: ${error.message}` };
  }
}
