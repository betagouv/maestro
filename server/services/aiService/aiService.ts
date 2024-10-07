import OpenAI from 'openai';
import { translateToEnglishPrompt } from '../../prompts/translateToEnglish.prompt';
import config from '../../utils/config';

export interface ReferenceEmbedding<T> {
  reference: T;
  embedding: number[];
}

const openai = new OpenAI({
  apiKey: config.apis.openai.apiKey,
});

const generateEmbeddings = async (labels: string[]): Promise<number[][]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: labels,
  });

  return response.data.map(
    (embedding: { embedding: number[] }) => embedding.embedding
  );
};

const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dotProduct / (magnitudeA * magnitudeB);
};

const normalizeText = (text: string) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .toLowerCase();
};

const translateToEnglish = async (text: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: translateToEnglishPrompt(text),
  });

  return completion.choices[0].message.content;
};

async function resolveReferenceWithEmbeddings<T>(
  text: string,
  referenceEmbeddings: ReferenceEmbedding<T>[]
): Promise<T | undefined> {
  console.log('resolveReferenceWithEmbeddings for text', text);

  const normalizedText = normalizeText(text);
  const translatedText = await translateToEnglish(normalizedText);
  const textEmbeddings = (
    await generateEmbeddings([translatedText as string])
  )[0];

  let bestMatch: {
    referenceEmbedding?: ReferenceEmbedding<T>;
    similarity: number;
  } = {
    similarity: -Infinity,
  };

  for (const referenceEmbedding of referenceEmbeddings) {
    const similarity = cosineSimilarity(
      textEmbeddings,
      referenceEmbedding.embedding
    );

    if (similarity > bestMatch.similarity) {
      bestMatch = {
        referenceEmbedding,
        similarity,
      };
    }
  }

  console.log('bestMatch', bestMatch.referenceEmbedding);

  return bestMatch.referenceEmbedding?.reference;
}

export { generateEmbeddings, cosineSimilarity, resolveReferenceWithEmbeddings };
