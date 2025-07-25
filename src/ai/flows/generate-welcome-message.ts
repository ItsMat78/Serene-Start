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
  message: z.string().describe('A personalized, motivating welcome message.'),
  focus: z.string().describe('A short suggestion on what the user could focus on, based on their tasks. Can be an empty string if there are no tasks.'),
});
export type WelcomeMessageOutput = z.infer<typeof WelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: WelcomeMessageInput): Promise<WelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'welcomeMessagePrompt',
  input: {schema: WelcomeMessageInputSchema},
  output: {schema: WelcomeMessageOutputSchema},
  prompt: `You are a helpful and motivating assistant designed to generate personalized welcome messages for a user's start page.

  Based on the time of day, day of the week, and their list of ongoing tasks, create a short, engaging, and relevant welcome message. The message should be positive and encouraging.

  Then, based on their tasks, provide a brief suggestion for what they could focus on. If there are no tasks, you can provide a general motivating sentence or leave the focus field empty.

  Time of day: {{{timeOfDay}}}
  Day of week: {{{dayOfWeek}}}
  Ongoing tasks:
  {{#if tasks}}
    {{#each tasks}}
    - {{{this}}}
    {{/each}}
  {{else}}
    No tasks for now.
  {{/if}}

  Example Output 1 (with tasks):
  {
    "message": "Good morning! Let's make this Tuesday a productive one.",
    "focus": "Looks like you have a few things on your plate. Maybe start with 'Design new landing page' to get the creative juices flowing."
  }

  Example Output 2 (no tasks):
  {
    "message": "Happy Friday evening! Time to wind down.",
    "focus": "No tasks on the list. Time to relax and recharge for the weekend!"
  }
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
