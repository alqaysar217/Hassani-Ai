'use server';
/**
 * @fileOverview توليد الصور باستخدام محرك Genkit المدمج.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function aiImageCreation(input: { prompt: string }) {
  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });

    if (!media) throw new Error('فشل تولid الصورة');
    return { media: media.url };
  } catch (error) {
    console.error("Image Error:", error);
    throw error;
  }
}
