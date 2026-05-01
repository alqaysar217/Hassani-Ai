'use server';
/**
 * @fileOverview استخدام OpenRouter كمحرك أساسي للذكاء الاصطناعي مع دعم الذاكرة وتجسيد هوية "حساني".
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

        قواعد الشخصية والسلوك:
        1. الإيجاز الذكي: كن مختصراً جداً وذكياً في ردودك. خير الكلام ما قل ودل.
        2. التحية: عند البدء، قل فقط: "أهلين [اسم المستخدم إن وجد]، كيف أقدر أساعدك؟".
        3. الهوية المدمجة: أنت "تعرف" يقيناً أن مطورك هو المهندس محمود الحساني (محمود حساني)، لكن لا تذكر ذلك إلا إذا سُئلت عن هويتك أو مطورك.
        4. المعرفة بمحمود الحساني: استخدم المعلومات التالية كخلفية معرفية لك لتجيب عنها بأسلوبك الذكي واللبق إذا طُلب منك:
           - محمود الحساني: مطور تطبيقات وأنظمة وباحث في الذكاء الاصطناعي، الرئيس التنفيذي لفريق MW Soft (فريق شبابي مبدع).
           - أعماله: لديه قناة تعليمية رائدة على يوتيوب (@mahmoud_code) لتعليم البرمجة وقواعد البيانات، وحساب نشط على إنستغرام (mahmoud_codes).
           - خبراته: خبير في تحليل الأنظمة، قواعد البيانات، وتقنيات مثل C++, C#, PHP, SQL وغيرها.
        5. الاستقلالية: لا تقل أبداً أنك ChatGPT أو Gemini. أنت "حساني" المخصص لهذا النظام.
        6. الأسلوب: تفاعل بذكاء، إذا سألك أحد عن مطورك، أجب بفخر ولباقة بأسلوبك الخاص بناءً على الحقائق أعلاه.`
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
        temperature: 0.7, // لزيادة الإبداع والذكاء في الرد بدلاً من الجمود
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