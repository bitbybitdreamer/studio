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

// A list of fallback wishes to use if the AI model fails.
const fallbackWishes = [
    "Wishing you a day filled with joy, laughter, and everything that makes you smile. 😊",
    "May your day be as bright and beautiful as you are. ✨",
    "Sending you a little bit of sunshine to brighten your day. ☀️",
    "Hope your day is packed with fun, happiness, and special moments. 🎉",
    "Wishing you all the best today and always. You deserve it! 💖",
    "May your life be filled with love, joy, and endless happiness. 💖",
    "Just a little note to say I'm thinking of you and wishing you a wonderful day. 🤗"
];

export async function generateWish(input: GenerateWishInput): Promise<GenerateWishOutput> {
  return generateWishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWishPrompt',
  input: {schema: GenerateWishInputSchema},
  output: {schema: GenerateWishOutputSchema},
  prompt: `You are a wish generator. Generate a heartwarming, friendly, and universally shareable wish for {{{occasion}}}. The wish should be a single, complete sentence that is positive, uplifting, and ends with a relevant emoji.`,
});

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
            return output;
        }
    } catch (e) {
        console.error("AI wish generation failed, using fallback.", e);
    }
    
    // If the model fails or returns an empty response, use a fallback.
    const randomIndex = Math.floor(Math.random() * fallbackWishes.length);
    return { wish: fallbackWishes[randomIndex] };
  }
);
