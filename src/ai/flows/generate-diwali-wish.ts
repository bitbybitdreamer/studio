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

export async function generateDiwaliWish(input: GenerateDiwaliWishInput): Promise<GenerateDiwaliWishOutput> {
  return generateDiwaliWishFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiwaliWishPrompt',
  input: {schema: GenerateDiwaliWishInputSchema},
  output: {schema: GenerateDiwaliWishOutputSchema},
  prompt: `You are a Diwali wish generator. Generate a heartwarming, family-friendly Diwali wish for the occasion of {{{occasion}}}. The wish must be a single, complete sentence. The response must be a JSON object with a "wish" property containing the generated wish.`,
});

const generateDiwaliWishFlow = ai.defineFlow(
  {
    name: 'generateDiwaliWishFlow',
    inputSchema: GenerateDiwaliWishInputSchema,
    outputSchema: GenerateDiwaliWishOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // Ensure we always return a valid object, even if the model output is empty.
    return output ?? { wish: "May the festival of lights bring endless joy to your life." };
  }
);
