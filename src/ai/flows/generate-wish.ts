
'use server';

/**
 * @fileOverview A wish generation AI agent.
 *
 * - generateWish - A function that generates a wish.
 * - GenerateWishInput - The input type for the generateWish function.
 * - GenerateWishOutput - The return type for the generateWish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWishInputSchema = z.object({
  occasion: z
    .string()
    .default('a happy occasion')
    .describe('The occasion for the wish, defaults to a happy occasion.'),
  cacheBuster: z.string().optional().describe('A random string to prevent caching.'),
});
export type GenerateWishInput = z.infer<typeof GenerateWishInputSchema>;

const GenerateWishOutputSchema = z.object({
  wish: z.string().describe('A heartwarming and friendly wish.'),
});
export type GenerateWishOutput = z.infer<typeof GenerateWishOutputSchema>;

export async function generateWish(input: GenerateWishInput): Promise<GenerateWishOutput> {
  return generateWishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWishPrompt',
  input: {schema: GenerateWishInputSchema},
  output: {schema: GenerateWishOutputSchema},
  prompt: `You are a wish generator. Generate a new, unique, heartwarming, friendly, and universally shareable wish for {{{occasion}}}. Use the following random seed to ensure uniqueness: {{{cacheBuster}}}. The wish must be a single, complete sentence that is positive, uplifting, and must end with a relevant emoji.`,
});

const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*$/u;
const FALLBACK_EMOJIS = ['✨', '💖', '🎉', '🪔', '⭐', '🎊'];
const FALLBACK_WISH = "Wishing you a Diwali that brings happiness, prosperity, and joy to you and your family. ✨";


const generateWishFlow = ai.defineFlow(
  {
    name: 'generateWishFlow',
    inputSchema: GenerateWishInputSchema,
    outputSchema: GenerateWishOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);

      if (output && output.wish) {
          if (!EMOJI_REGEX.test(output.wish)) {
              const randomIndex = Math.floor(Math.random() * FALLBACK_EMOJIS.length);
              const randomEmoji = FALLBACK_EMOJIS[randomIndex];
              output.wish = `${output.wish.replace(/[.,!?:; ]*$/, '')} ${randomEmoji}`;
          }
          return output;
      }
    } catch (error) {
      console.error("AI wish generation failed, returning fallback:", error);
    }
    
    return { wish: FALLBACK_WISH };
  }
);
