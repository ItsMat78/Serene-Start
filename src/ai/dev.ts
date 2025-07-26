import {config} from 'dotenv';
config({path: `.env`});

import '@/ai/flows/generate-welcome-message.ts';
import '@/ai/flows/text-to-speech.ts';
