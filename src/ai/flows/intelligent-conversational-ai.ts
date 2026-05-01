'use server';
/**
 * @fileOverview المحرك الأساسي لحساني - يستخدم Genkit لضمان استقرار الردود وسرعتها.
 */

import { ai } from '@/ai/genkit';
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

export async function intelligentConversationalAi(
  input: IntelligentConversationalAiInput
): Promise<IntelligentConversationalAiOutput> {
  return intelligentConversationalAiFlow(input);
}

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
- استخدم صناديق الكود \` \` \` دائماً للروابط والأكواد لتكون قابلة للنسخ.
- التزم بالمحاذاة اليمينية للنص العربي RTL.
- الحسابات الرسمية:
  - يوتيوب: \`https://www.youtube.com/@mahmoud_code\`
  - إنستغرام: \`https://www.instagram.com/mahmoud_codes/\`
  - فيسبوك: \`https://www.facebook.com/pr.mahmoud.20\``;

const intelligentConversationalAiFlow = ai.defineFlow(
  {
    name: 'intelligentConversationalAiFlow',
    inputSchema: IntelligentConversationalAiInputSchema,
    outputSchema: IntelligentConversationalAiOutputSchema,
  },
  async (input) => {
    const history = input.history?.map(m => ({
      role: m.role,
      content: [{ text: m.content }]
    })) || [];

    const promptParts: any[] = [{ text: input.query }];
    if (input.imageHeader) {
      promptParts.push({ media: { url: input.imageHeader, contentType: 'image/jpeg' } });
    }

    const { text } = await ai.generate({
      system: SYSTEM_PROMPT,
      history: history as any,
      prompt: promptParts,
      config: {
        temperature: 0.7,
      }
    });

    return { response: text || "أهلاً بك! كيف يمكنني مساعدتك؟" };
  }
);
