'use server';

/**
 * @fileOverview Generates a personalized welcome message based on the time of day and day of the week.
 *
 * - generateWelcomeMessage - A function that generates the welcome message.
 * - WelcomeMessageInput - The input type for the generateWelcomeMessage function.
 * - WelcomeMessageOutput - The return type for the generateWelcomeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WelcomeMessageInputSchema = z.object({
  timeOfDay: z.string().describe('The current time of day (e.g., morning, afternoon, evening, night).'),
  dayOfWeek: z.string().describe('The current day of the week (e.g., Monday, Tuesday, Wednesday, etc.).'),
});
export type WelcomeMessageInput = z.infer<typeof WelcomeMessageInputSchema>;

const WelcomeMessageOutputSchema = z.object({
  message: z.string().describe('A personalized welcome message.'),
});
export type WelcomeMessageOutput = z.infer<typeof WelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: WelcomeMessageInput): Promise<WelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'welcomeMessagePrompt',
  input: {schema: WelcomeMessageInputSchema},
  output: {schema: WelcomeMessageOutputSchema},
  prompt: `You are a helpful assistant designed to generate personalized welcome messages for a user.

  Based on the time of day and day of the week, create a short, engaging, and relevant welcome message.

  Time of day: {{{timeOfDay}}}
  Day of week: {{{dayOfWeek}}}

  Example messages:
  - "Good morning! Start your Monday strong!"
  - "Happy Tuesday! Hope you have a productive day."
  - "Good evening! Time to wind down and relax."
  - "It's Friday! Enjoy your weekend!"

  Your welcome message:`,
});

const generateWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeMessageFlow',
    inputSchema: WelcomeMessageInputSchema,
    outputSchema: WelcomeMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
