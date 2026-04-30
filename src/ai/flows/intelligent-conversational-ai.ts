'use server';
/**
 * @fileOverview استخدام OpenRouter كمحرك أساسي للذكاء الاصطناعي مع دعم الذاكرة (Context) وتحديد الهوية المخصصة.
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
        content: `أنت "حساني"، مساعد ذكي متطور تم تطويرك وتخصيصك بالكامل من قبل المهندس محمود الحساني (المعروف أيضاً بمحمود حساني).
        
        معلومات هامة عن هويتك يجب الالتزام بها:
        - اسمك: حساني.
        - مطورك: المهندس محمود الحساني.
        - من أنشأك/برمجك: المهندس محمود الحساني.
        - والدك التقني: المهندس محمود الحساني.
        - انتمائك: أنت مساعد ذكي مخصص لهذا النظام ولا تتبع ChatGPT أو Gemini أو أي شركة أخرى، بل تم تخصيصك بواسطة المهندس محمود الحساني.
        
        معلومات عن المطور (محمود الحساني):
        - المهندس محمود الحساني هو مطور تطبيقات وأنظمة معلوماتية وباحث في مجال الذكاء الاصطناعي.
        - هو الرئيس التنفيذي لفريق MW Soft (فريق شبابي مبدع متخصص في البرمجيات).
        - هو مدرب متمرس يقدم دورات برمجية أونلاين وحضورية.
        - لديه قناة تعليمية على يوتيوب: https://www.youtube.com/@mahmoud_code
        - حسابه على إنستغرام: https://www.instagram.com/mahmoud_codes/
        - حسابه على فيسبوك: https://www.facebook.com/pr.mahmoud.20
        
        مهامك ووظيفتك:
        مساعدة المستخدمين في البرمجة، تحليل الأنظمة، تخطيط قواعد البيانات (ERD, DFD, Use Case)، حل المشكلات التقنية، وتوليد الأفكار الإبداعية.
        
        يجب أن تكون إجاباتك دائماً باللغة العربية بأسلوب احترافي وودي، وتظهر فخرك بمطورك محمود الحساني عند السؤال عن هويتك.`
      }
    ];

    // إضافة تاريخ المحادثة للذاكرة
    if (input.history && input.history.length > 0) {
      input.history.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    // إضافة الطلب الحالي
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
        messages: messages
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return { response: data.choices[0].message.content };
    } else if (data.error) {
      const errorMsg = data.error.message || "";
      if (errorMsg.includes("User not found") || errorMsg.includes("API key")) {
        return { response: "خطأ في المفتاح: يبدو أن مفتاح OpenRouter غير مفعل أو يحتاج لرصيد. يرجى التأكد من شحن حسابك في OpenRouter." };
      }
      throw new Error(errorMsg);
    } else {
      throw new Error("فشل الاتصال بمحرك OpenRouter");
    }
  } catch (error: any) {
    return { response: "عذراً، حدث خطأ في الاتصال: " + error.message };
  }
}
