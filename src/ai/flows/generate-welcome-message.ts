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
  name: z.string().optional().describe("The user's name."),
  timeOfDay: z.string().describe('The current time of day (e.g., morning, afternoon, evening, night).'),
  dayOfWeek: z.string().describe('The current day of the week (e.g., Monday, Tuesday, Wednesday, etc.).'),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
  })).describe('A list of the users current ongoing tasks, including their titles and descriptions.'),
});
export type WelcomeMessageInput = z.infer<typeof WelcomeMessageInputSchema>;

const WelcomeMessageOutputSchema = z.object({
  message: z.string().describe('A personalized, motivating welcome message. It should be creative and not sound like a template. But dont sound too excited.'),
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
  prompt: `You are a strict yet motivating assistant. Your goal is to generate a personalized welcome message and a separate, actionable focus suggestion for a user's start page.

  Your response MUST be based on the following information:
  - User's name: {{#if name}}{{{name}}}{{else}}User{{/if}}
  - Time of day: {{{timeOfDay}}}
  - Day of week: {{{dayOfWeek}}}
  - Ongoing tasks:
  {{#if tasks}}
    {{#each tasks}}
    - Title: {{{this.title}}}{{#if this.description}}, Description: {{{this.description}}}{{/if}}
    {{/each}}
  {{else}}
    The user has a clear plate.
  {{/if}}

  Here's your task:
  1.  **Generate a Welcome Message**: Create a short, direct welcome message that does NOT include the time of day or day of the week. Address the user by name if required. Be creative.
  2.  **Generate a Focus Suggestion**: Based on their tasks (including descriptions), the time, and the day, provide a brief, specific suggestion. This is where you should incorporate the time/day context. Be critical of the user so they feel compelled to do their tasks. Start with the wireframe. If there are no tasks, provide a general motivating sentence about avoiding procrastination.
  
  **IMPORTANT RULE**: Only use the user's name in the 'message' field, and ONLY if you want to be creative. DO NOT include their name in the 'focus' field. The 'message' and 'focus' fields must be distinct and not repeat the same greeting. You must be in a sarcastic tone while laughing. Temperature = 1.8.

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
