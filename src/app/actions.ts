'use server';

import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Task } from '@/lib/types';

export async function getWelcomeMessageAction(tasks: Array<Pick<Task, 'title' | 'description'>>, name?: string) {
  const date = new Date();
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
  const hour = date.getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else if (hour >= 21 || hour < 5) timeOfDay = 'night';

  try {
    const result = await generateWelcomeMessage({ timeOfDay, dayOfWeek, tasks, name });
    return result;
  } catch (error) {
    console.error('Failed to generate welcome message:', error);
    return {
        message: "Welcome back! Let's make today productive.",
        focus: "Add a task to get started."
    };
  }
}

export async function getGreetingSpeechAction(message: string) {
    try {
        const result = await textToSpeech(message);
        return result;
    } catch (error) {
        console.error('Failed to generate speech:', error);
        return { audio: null };
    }
}
