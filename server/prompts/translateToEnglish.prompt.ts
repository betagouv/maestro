import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

export const translateToEnglishPrompt = (
  text: string
): ChatCompletionMessageParam[] => [
  { role: 'system', content: 'You are a translation assistant.' },
  {
    role: 'user',
    content: `Translate the following text to English: ${text}`,
  },
];
