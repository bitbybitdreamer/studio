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

const generateWishFlow = ai.defineFlow(
  {
    name: 'generateWishFlow',
    inputSchema: GenerateWishInputSchema,
    outputSchema: GenerateWishOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && output.wish) {
        return output;
    }
    throw new Error("AI wish generation failed to return a wish.");
  }
);
