
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
  prompt: `You are a wish generator. Generate a new, unique, heartwarming, friendly, and universally shareable wish for {{{occasion}}}. The wish should be a single, complete sentence that is positive, uplifting, and ends with a relevant emoji.`,
});

const EMOJI_REGEX = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/;
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
          // Check if the wish already ends with an emoji.
          if (!EMOJI_REGEX.test(output.wish.slice(-2))) {
              const randomEmoji = FALLBACK_EMOJIS[Math.floor(Math.random() * FALLBACK_EMOJIS.length)];
              output.wish = `${output.wish.replace(/[.,!?:;]*$/, '')} ${randomEmoji}`;
          }
          return output;
      }
    } catch (error) {
      console.error("AI wish generation failed:", error);
    }
    
    // Fallback if AI fails or returns an empty wish
    return { wish: FALLBACK_WISH };
  }
);
