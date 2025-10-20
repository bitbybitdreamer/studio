'use server';
/**
 * @fileOverview An AI agent for generating an image from a wish.
 *
 * - generateImageFromWish - A function that handles the image generation.
 * - GenerateImageFromWishInput - The input type for the generateImageFromWish function.
 * - GenerateImageFromWishOutput - The return type for the generateImageFromWish function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromWishInputSchema = z.object({
  wish: z.string().describe('The wish to generate an image from.'),
});
export type GenerateImageFromWishInput = z.infer<typeof GenerateImageFromWishInputSchema>;

const GenerateImageFromWishOutputSchema = z.object({
    imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateImageFromWishOutput = z.infer<typeof GenerateImageFromWishOutputSchema>;

export async function generateImageFromWish(input: GenerateImageFromWishInput): Promise<GenerateImageFromWishOutput> {
  return generateImageFromWishFlow(input);
}

const generateImageFromWishFlow = ai.defineFlow(
  {
    name: 'generateImageFromWishFlow',
    inputSchema: GenerateImageFromWishInputSchema,
    outputSchema: GenerateImageFromWishOutputSchema,
  },
  async ({ wish }) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Generate a beautiful, high-quality, and heartwarming image that visually represents the following wish. The image should be festive, artistic, and suitable for a greeting card. Wish: "${wish}"`,
    });

    if (!media?.url) {
        throw new Error('AI image generation failed to return an image.');
    }

    return { imageDataUri: media.url };
  }
);
