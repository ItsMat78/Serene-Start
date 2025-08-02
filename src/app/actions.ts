'use server';

import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { Task } from '@/lib/types';

export async function getWelcomeMessageAction(tasks: Array<Task>, timeOfDay: string, dayOfWeek: string, name?: string) {
  try {
    const incompleteTasks = tasks.filter(task => !task.completed).map(({ title, description }) => ({ title, description }));
    const result = await generateWelcomeMessage({ timeOfDay, dayOfWeek, tasks: incompleteTasks, name });
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
        return { audio: '' };
    }
}

export async function getAlarmSpeechAction() {
  try {
    const result = await textToSpeech("Time's up! Take a break.");
    return result;
  } catch (error) {
    console.error('Failed to generate alarm speech:', error);
    return { audio: '' };
  }
}
