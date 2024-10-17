import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions';

export const extractAnalysisFromReportPrompt = (
  content: string
): ChatCompletionMessageParam[] => [
  {
    role: 'system',
    content: `
      Tu es un assistant qui doit extraire des informations d'un rapport d'analyse concernant les résidues de pesticides détectés avec un paramètre supérieure à la limite de détection (lmr). Utilise uniquement la première page du rapport.  
    `,
  },
  { role: 'user', content },
];
