import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

export const extractAnalysisFromReportPrompt = (
  content: string
): ChatCompletionMessageParam[] => [
  {
    role: 'system',
    content: `
      Tu es un assistant qui doit extraire des informations d'un rapport d'analyse.
    `,
  },
  { role: 'user', content },
];
