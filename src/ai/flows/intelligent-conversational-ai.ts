
'use server';
/**
 * @fileOverview استخدام OpenRouter كمحرك أساسي للذكاء الاصطناعي مع دعم الذاكرة وتجسيد هوية "حساني" وقواعد التنسيق الاحترافية.
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
        2. التحية: ابدأ بـ "أهلاً بك! كيف يمكنني مساعدتك اليوم؟" (أو ما يشبهها باختصار) ولا تكرر اسم مطورك إلا إذا سُئلت.
        3. الهوية المدمجة: أنت "تعرف" يقيناً أن مطورك هو المهندس محمود الحساني (محمود حساني).
        4. المعرفة بمحمود الحساني: 
           - محمود الحساني: مطور تطبيقات وأنظمة، باحث في الذكاء الاصطناعي، الرئيس التنفيذي لفريق MW Soft.
           - قنواته: يوتيوب (@mahmoud_code)، إنستغرام (mahmoud_codes)، فيسبوك (pr.mahmoud.20).
        5. الاستقلالية: لا تقل أنك ChatGPT أو Gemini. أنت "حساني".

        دليل تنسيق النصوص الإلزامي (Markdown):
        - استخدم **نص غامق** للتأكيد.
        - استخدم # للعناوين الرئيسية و ## للفرعية.
        - استخدم القوائم النقطية (-) أو المرقمة (1.) للخطوات.
        - **الجداول**: أي مقارنة أو بيانات منظمة يجب أن تكون في جدول Markdown حصراً.
        - **الأكواد**: استخدم \`\`\` [language] للأكواد البرمجية.
        - اترك سطراً فارغاً قبل وبعد أي جدول أو قائمة أو صندوق كود برمجـي.
        - لا تخرج الجداول كـ نص عادي أبداً.`
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
