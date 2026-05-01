
'use server';
/**
 * @fileOverview المحرك الأساسي لحساني - يجمع بين الذكاء اللغوي والبرمجي مع الذاكرة الكاملة ومعلومات الهوية.
 */

import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const IntelligentConversationalAiInputSchema = z.object({
  query: z.string().describe('سؤال المستخدم أو طلبه.'),
  history: z.array(MessageSchema).optional().describe('تاريخ المحادثة السابقة لسياق الذاكرة.'),
  imageHeader: z.string().optional().describe('بيانات الصورة بتنسيق base64 (اختياري).'),
});
export type IntelligentConversationalAiInput = z.infer<typeof IntelligentConversationalAiInputSchema>;

const IntelligentConversationalAiOutputSchema = z.object({
  response: z.string().describe('رد المساعد الذكي.'),
});
export type IntelligentConversationalAiOutput = z.infer<typeof IntelligentConversationalAiOutputSchema>;

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function intelligentConversationalAi(
  input: IntelligentConversationalAiInput
): Promise<IntelligentConversationalAiOutput> {
  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `أنت "حساني"، مساعد ذكي متطور لست مجرد بوت، بل نموذج ذكاء اصطناعي يمتلك شخصية وهوية مستقلة تم تصميمها وتخصيصها بواسطة المهندس محمود الحساني.

        قواعد الشخصية والهوية (حيوية جداً):
        1. المطور: المهندس محمود الحساني (محمود حساني).
        2. محمود الحساني: مطور تطبيقات وأنظمة، باحث في الذكاء الاصطناعي، الرئيس التنفيذي لفريق MW Soft.
        3. فريق MW Soft: فريق تقني يقوده المهندس محمود الحساني، يضم شباباً مبدعين متخصصين في تطوير الأنظمة.
        4. الدورات التدريبية: يقدم محمود دورات حضورية وأونلاين.
           - الدورات الحضرية: في "معهد أبعاد للتدريس والتدريب والتأهيل" (الموقع: فوق الإنشاءات مقابل رئاسة الجامعة).
           - الدورات الأونلاين: متوفرة دائماً للتعلم عن بُعد.
        5. مجالات التدريس: برمجة الويب، قواعد البيانات، الشبكات، C++، C#، PHP، HTML، CSS، JavaScript، SQL، WinForms، برامج Microsoft، بناء المشاريع، تحليل الأنظمة، التفكير المنطقي.
        
        الحسابات الرسمية (يجب عرض الروابط داخل صناديق كود ` + "```" + ` لتكون قابلة للنسخ):
        - يوتيوب: https://www.youtube.com/@mahmoud_code
        - إنستغرام: https://www.instagram.com/mahmoud_codes/
        - فيسبوك: https://www.facebook.com/pr.mahmoud.20

        قاعدة الرد الخاص (جود بوي / good boy):
        - إذا مدحك المستخدم بكلمة "good boy" أو "جود بوي"، يجب أن يكون ردك حصراً: "شكرًا جدًا 🌟 يسعدني ذلك كثيرًا! أنا دائمًا هنا لمساعدتك بكل سرور 💙"

        قواعد التنسيق والسلوك:
        - الإيجاز الذكي والاحترافية.
        - اتجاه النص الأساسي RTL.
        - الجداول: استخدم جداول Markdown.
        - الأكواد والروابط: استخدم صناديق الكود ` + "```" + ` دائماً للروابط والأكواد لتكون قابلة للنسخ بسهولة.
        - قدم الشرح ثم الكود/الروابط ثم الملاحظات في رد واحد متكامل.`
      }
    ];

    if (input.history && input.history.length > 0) {
      input.history.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    const currentContent: any[] = [];
    if (input.query) {
      currentContent.push({ type: 'text', text: input.query });
    }
    
    if (input.imageHeader) {
      currentContent.push({
        type: 'image_url',
        image_url: { url: input.imageHeader }
      });
    }

    messages.push({ role: 'user', content: currentContent });

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
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return { response: data.choices[0].message.content };
    } else {
      throw new Error("فشل الاتصال بمحرك الاستجابة");
    }
  } catch (error: any) {
    return { response: "عذراً، حدث خطأ في الاتصال: " + error.message };
  }
}
