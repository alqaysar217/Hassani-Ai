'use server';
/**
 * @fileOverview يكتشف نية المستخدم باستخدام OpenRouter لضمان التجاوب الفوري.
 */

import { z } from 'zod';

const OPENROUTER_API_KEY = "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";
const MODEL = "google/gemini-2.0-flash-001";

export async function automaticIntentRouting(input: { query: string }) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `صنف طلب المستخدم التالي إلى واحد من هذه التصنيفات حصراً وأرجع التصنيف ككلمة واحدة فقط:
            - 'question': أسئلة عامة.
            - 'image': طلبات توليد صور.
            - 'music': موسيقى.
            - 'programming': برمجة.
            - 'diagram': مخططات.
            - 'planning': تخطيط.`
          },
          { role: 'user', content: input.query }
        ],
        temperature: 0,
      })
    });

    const data = await response.json();
    const intent = data.choices?.[0]?.message?.content?.toLowerCase().trim() || 'question';
    return { intent: intent.includes('image') ? 'image' : intent.includes('diagram') ? 'diagram' : intent.includes('programming') ? 'programming' : 'question' };
  } catch (error) {
    return { intent: 'question' };
  }
}
