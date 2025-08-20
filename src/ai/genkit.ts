import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Helper function to get environment variable with a default
function getEnv(name: string, defaultValue: string = ''): string {
  const value = process.env[name];
  if (value === undefined) {
    // console.warn(`Environment variable ${name} not set, using default: '${defaultValue}'`);
    return defaultValue;
  }
  return value;
}

// Check if Google API Key is configured
const googleApiKey = getEnv('NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY');

if (!googleApiKey && process.env.NODE_ENV !== 'test') {
  console.warn(
    `Google API Key (NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY) is not configured in your .env.local file. Genkit AI features may not work.`
  );
}

export const ai: Genkit = genkit({
  plugins: [
    googleAI({
      apiKey: googleApiKey || 'YOUR_GOOGLE_GEMINI_API_KEY_PLACEHOLDER',
    }), // Provide a placeholder if not set
  ],
  // Default model for text generation
  model: 'googleai/gemini-1.5-flash-latest', // Or your preferred model
  // Default model for image generation (can be overridden in specific calls)
  // Ensure you use a model that supports image generation like 'gemini-2.0-flash-exp'
  // imageModel: 'googleai/gemini-2.0-flash-exp',

  // Optional: Configure default safety settings (example)
  // Default safety settings can be overridden in individual generate calls or prompts
  // safetySettings: [
  //   {
  //     category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  //     threshold: 'BLOCK_ONLY_HIGH',
  //   },
  // ],

  // Optional: Default generation config
  // generationConfig: {
  //   temperature: 0.7,
  //   maxOutputTokens: 1024,
  // },

  // Enable flow state storage (uses Firestore by default if Firebase plugin is present and configured)
  // flowStateStore: 'firebase', // or 'memory' for local dev without persistence

  // Enable trace store (uses Firestore by default if Firebase plugin is present and configured)
  // traceStore: 'firebase', // or 'memory' for local dev without persistence

  // Set log level (info, warn, error, debug)
  // logLevel: 'info',
});

// Schemas for common config options can be defined here if needed

// You can also export predefined model instances for convenience
// export const geminiFlash = ai.getModel('googleai/gemini-1.5-flash-latest');
// export const geminiPro = ai.getModel('googleai/gemini-1.5-pro-latest');
// export const geminiImageGenerator = ai.getModel('googleai/gemini-2.0-flash-exp');
