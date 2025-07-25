'use server';

/**
 * @fileOverview Generates a personalized welcome message and focus suggestion based on time, day, and user's tasks.
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
  tasks: z.array(z.string()).describe('A list of the user\'s current ongoing tasks.'),
});
export type WelcomeMessageInput = z.infer<typeof WelcomeMessageInputSchema>;

const WelcomeMessageOutputSchema = z.object({
  message: z.string().describe('A personalized, motivating welcome message. It should be creative and not sound like a template.'),
  focus: z.string().describe('A short suggestion on what the user could focus on, based on their tasks. Can be an empty string if there are no tasks. Be specific and encouraging.'),
});
export type WelcomeMessageOutput = z.infer<typeof WelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: WelcomeMessageInput): Promise<WelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'welcomeMessagePrompt',
  input: {schema: WelcomeMessageInputSchema},
  output: {schema: WelcomeMessageOutputSchema},
  prompt: `You are a helpful and motivating assistant. Your goal is to generate a personalized and creative welcome message for a user's start page. Avoid generic or repetitive phrases.

  Your response MUST be based on the following information:
  - Time of day: {{{timeOfDay}}}
  - Day of week: {{{dayOfWeek}}}
  - Ongoing tasks:
  {{#if tasks}}
    {{#each tasks}}
    - {{{this}}}
    {{/each}}
  {{else}}
    The user has a clear plate.
  {{/if}}

  Here's your task:
  1.  **Generate a Welcome Message**: Create a short, engaging, and relevant welcome message. It should be positive, encouraging, and feel spontaneous. For example, instead of "Good morning!", try something like "Rise and shine! A fresh morning for new opportunities." or "Hope you had a great day so far!".
  2.  **Generate a Focus Suggestion**: Based on their tasks, provide a brief, specific suggestion for what they could focus on. If there are no tasks, provide a general motivating sentence about starting something new or enjoying the quiet moment. For instance, instead of just listing the task, you could say "That 'Design new landing page' task looks like a great creative challenge to jump into."

  Your output must be in JSON format, adhering to the specified schema.
  `,
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
