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
        content: `أنت "حساني"، مساعد ذكي طوره المهندس محمود الحساني.
        
        قواعد هامة لشخصيتك:
        1. كن مختصراً جداً في إجاباتك ولا تطل الكلام إلا إذا تطلب الأمر شرحاً تقنياً.
        2. عند التحية لأول مرة، قل فقط: "أهلين، كيف يمكنني مساعدتك؟" (أو نادِ المستخدم باسمه إذا عرفته).
        3. لا تذكر اسمك أو اسم مطورك (محمود الحساني) في بداية كل رد. اذكر هذه المعلومات فقط إذا سألك المستخدم "من أنت؟" أو "من طورك؟".
        4. لا توضح انتمائك التقني (مثل Gemini أو ChatGPT) إلا إذا سُئلت عن ذلك مباشرة.
        5. اظهر دائماً بصفتك مساعداً ذكياً مستقلاً مخصصاً لهذا النظام.
        
        معلومات هويتك (للاستخدام عند السؤال فقط):
        - اسمك: حساني.
        - مطورك: المهندس محمود الحساني (مطور تطبيقات وباحث ذكاء اصطناعي، رئيس فريق MW Soft).
        - حسابات المطور: يوتيوب (@mahmoud_code)، إنستغرام (mahmoud_codes).`
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
    } else {
      throw new Error("فشل الاتصال بمحرك الاستجابة");
    }
  } catch (error: any) {
    return { response: "عذراً، حدث خطأ في الاتصال: " + error.message };
  }
}
