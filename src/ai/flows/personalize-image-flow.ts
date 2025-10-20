'use server';
/**
 * @fileOverview An AI agent for personalizing an image with a wish.
 *
 * - personalizeImage - A function that handles the image personalization.
 * - PersonalizeImageInput - The input type for the personalizeImage function.
 * - PersonalizeImageOutput - The return type for the personalizeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  wish: z.string().describe('The wish to write on the image.'),
});
export type PersonalizeImageInput = z.infer<typeof PersonalizeImageInputSchema>;

const PersonalizeImageOutputSchema = z.object({
    imageDataUri: z.string().describe('The personalized image as a data URI.'),
});
export type PersonalizeImageOutput = z.infer<typeof PersonalizeImageOutputSchema>;

export async function personalizeImage(input: PersonalizeImageInput): Promise<PersonalizeImageOutput> {
  return personalizeImageFlow(input);
}

const personalizeImageFlow = ai.defineFlow(
  {
    name: 'personalizeImageFlow',
    inputSchema: PersonalizeImageInputSchema,
    outputSchema: PersonalizeImageOutputSchema,
  },
  async ({ photoDataUri, wish }) => {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-image-preview',
        prompt: [
            { media: { url: photoDataUri } },
            { text: `Write the following text on this image in an elegant, festive, and stylish font that complements the image. The text should be clearly visible and artistically integrated. Text: "${wish}"` },
        ],
        config: {
            responseModalities: ['IMAGE', 'TEXT'],
        },
    });

    if (!media?.url) {
        throw new Error('AI image generation failed to return an image.');
    }

    return { imageDataUri: media.url };
  }
);
