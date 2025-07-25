'use server';

import { generateWelcomeMessage } from '@/ai/flows/generate-welcome-message';

export async function getWelcomeMessageAction() {
  const date = new Date();
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
  const hour = date.getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else if (hour >= 21 || hour < 5) timeOfDay = 'night';

  try {
    const result = await generateWelcomeMessage({ timeOfDay, dayOfWeek });
    return result.message;
  } catch (error) {
    console.error('Failed to generate welcome message:', error);
    return "Welcome back! Let's make today productive.";
  }
}
