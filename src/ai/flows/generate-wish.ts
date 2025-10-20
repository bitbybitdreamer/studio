
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
  prompt: `You are a wish generator. Generate a new, unique, heartwarming, friendly, and universally shareable wish for {{{occasion}}}. The wish must be a single, complete sentence that is positive, uplifting, and must end with a relevant emoji.`,
});

// A more robust regex to detect a wide range of emojis at the end of a string.
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

      // If AI returns a valid wish, process it.
      if (output && output.wish) {
          // Check if the wish already ends with an emoji.
          if (!EMOJI_REGEX.test(output.wish)) {
              // Ensure a new random emoji is picked every time.
              const randomIndex = Math.floor(Math.random() * FALLBACK_EMOJIS.length);
              const randomEmoji = FALLBACK_EMOJIS[randomIndex];
              // Append a random emoji if one is missing.
              output.wish = `${output.wish.replace(/[.,!?:; ]*$/, '')} ${randomEmoji}`;
          }
          return output;
      }
    } catch (error) {
      // Log the error for debugging, but don't let it crash the app.
      console.error("AI wish generation failed, returning fallback:", error);
    }
    
    // If the AI fails for any reason (error, empty output), return a safe fallback wish.
    return { wish: FALLBACK_WISH };
  }
);
