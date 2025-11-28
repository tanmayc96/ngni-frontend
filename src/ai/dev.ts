import { config } from 'dotenv';
config({ path: '.env.local' }); // Ensure .env.local is loaded for dev if not already

import '@/ai/flows/chat-with-report-flow';
