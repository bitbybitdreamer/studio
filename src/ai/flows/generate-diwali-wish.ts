'use server';

/**
 * @fileOverview A Diwali wish generation AI agent.
 *
 * - generateDiwaliWish - A function that generates a Diwali wish.
 * - GenerateDiwaliWishInput - The input type for the generateDiwaliWish function.
 * - GenerateDiwaliWishOutput - The return type for the generateDiwaliWish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiwaliWishInputSchema = z.object({
  occasion: z
    .string()
    .default('Diwali')
    .describe('The occasion for the wish, defaults to Diwali.'),
});
export type GenerateDiwaliWishInput = z.infer<typeof GenerateDiwaliWishInputSchema>;

const GenerateDiwaliWishOutputSchema = z.object({
  wish: z.string().describe('A heartwarming Diwali wish.'),
});
export type GenerateDiwaliWishOutput = z.infer<typeof GenerateDiwaliWishOutputSchema>;

// A list of fallback wishes to use if the AI model fails.
const fallbackWishes = [
    "May the festival of lights fill your home with joy, your heart with love, and your life with prosperity.",
    "Wishing you a Diwali that's as bright as the diyas and as sweet as the mithai.",
    "May the divine light of Diwali bring peace to your mind and happiness to your heart.",
    "Let each diya you light bring a glow of happiness on your face and enlighten your soul.",
    "Wishing you and your family a sparkling Diwali and a prosperous new year.",
    "May the beauty of Diwali fill your home with happiness, and may the coming year provide you with all that brings you joy.",
    "On this auspicious festival of lights, may the glow of joy, prosperity, and happiness illuminate your life and your home."
];

export async function generateDiwaliWish(input: GenerateDiwaliWishInput): Promise<GenerateDiwaliWishOutput> {
  return generateDiwaliWishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiwaliWishPrompt',
  input: {schema: GenerateDiwaliWishInputSchema},
  output: {schema: GenerateDiwaliWishOutputSchema},
  prompt: `You are a Diwali wish generator. Generate a heartwarming, family-friendly Diwali wish for the occasion of {{{occasion}}}. The wish must be a single, complete sentence.`,
});

const generateDiwaliWishFlow = ai.defineFlow(
  {
    name: 'generateDiwaliWishFlow',
    inputSchema: GenerateDiwaliWishInputSchema,
    outputSchema: GenerateDiwaliWishOutputSchema,
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
