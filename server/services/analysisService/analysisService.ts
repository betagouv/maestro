import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import z from 'zod';
import { OptionalBoolean } from '../../../shared/referential/OptionnalBoolean';
import { SimpleResidue } from '../../../shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from '../../../shared/referential/Residue/SimpleResidueLabels';
import { ResidueCompliance } from '../../../shared/schema/Analysis/Residue/ResidueCompliance';
import { ResidueKind } from '../../../shared/schema/Analysis/Residue/ResidueKind';
import { ResultKind } from '../../../shared/schema/Analysis/Residue/ResultKind';
import { extractAnalysisFromReportPrompt } from '../../prompts/extractAnalysisFromReport.prompt';
import { translateToEnglishPrompt } from '../../prompts/translateToEnglish.prompt';
import config from '../../utils/config';
import documentService from '../documentService/documentService';
const openai = new OpenAI({
  apiKey: config.apis.openai.apiKey,
});

const ResidueExtraction = z.object({
  label: z.string(),
  residueNumber: z.number().int(),
  kind: ResidueKind,
  resultKind: ResultKind.nullish(),
  result: z.number().nullish(),
  LMR: z.number().nullish().describe('LMR value. Not the LQ value'),
  resultHigherThanArfd: OptionalBoolean,
  notesOnResult: z.string().nullish(),
  substanceApproved: OptionalBoolean,
  substanceAuthorised: OptionalBoolean,
  pollutionRisk: OptionalBoolean.nullish(),
  notesOnPollutionRisk: z.string().nullish(),
  compliance: ResidueCompliance,
});

const AnalyseExtraction = z.object({
  kind: z.enum(['Mono', 'Multi']).optional(),
  residues: z
    .array(ResidueExtraction)
    .optional()
    .describe(
      'Contains only the residues that were detected in the sample. (Residues marked as "ND" are not included.)'
    ),
  compliance: z.boolean().optional(),
  notesOnCompliance: z.string().nullable().optional(),
});

type AnalyseExtraction = z.infer<typeof AnalyseExtraction>;

interface ResidueEmbedding {
  code: SimpleResidue;
  embedding: number[];
}

// const retrieveReferences = async (
//   analysisExtraction: AnalyseExtraction
// ): Promise<AnalyseExtraction> => {
//   const prompt = `
//     Tu es un assistant qui doit enrichir les labels dans un flux JSON avec les codes associés en te basant sur ${Object.entries(
//       SimpleResidueLabels
//     )}.
//     Retrouve la ligne qui a le label le plus proche du texte sans accent traduit en anglais.
//     Tu dois retourner le JSON modifié.
//
//     Pour {"label": "Chlorméquat (+ sels)"} retourne {"label": "Chlormequat (sum of chlormequat and its salts, expressed as chlormequat-chloride)" ,"code":"RF-00005727-PAR"}.
//
//     Réponds uniquement en JSON valide sans les balises \`\`\`json ou \`\`\`.
//   `;
//
//   const completion = await openai.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages: [
//       {
//         role: 'system',
//         content: prompt,
//       },
//       { role: 'user', content: JSON.stringify(analysisExtraction) },
//     ],
//   });
//
//   console.log(analysisExtraction, completion.choices[0].message.content);
//
//   return JSON.parse(
//     completion.choices[0].message.content ?? '{}'
//   ) as AnalyseExtraction;
// };

// Fonction pour générer des embeddings pour vos labels
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

const resolveReference = async (
  residueLabel: string,
  residueEmbeddings: ResidueEmbedding[]
): Promise<SimpleResidue | undefined> => {
  console.log('resolveReference RESIDUE LABEL', residueLabel);

  const normalizedText = normalizeText(residueLabel);
  const translatedText = await translateToEnglish(normalizedText);
  const residueEmbedding = (
    await generateEmbeddings([translatedText as string])
  )[0];

  let bestMatch = { code: '', similarity: -Infinity };

  for (const reference of residueEmbeddings) {
    const similarity = cosineSimilarity(residueEmbedding, reference.embedding);

    if (similarity > bestMatch.similarity) {
      bestMatch = {
        code: reference.code,
        similarity,
      };
    }
  }

  console.log('BEST MATCH', bestMatch);

  return bestMatch.code as SimpleResidue | undefined;
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

const retrieveReferencesWithEmbeddings = async (
  analysisExtraction: AnalyseExtraction
): Promise<AnalyseExtraction> => {
  // Génération des embeddings pour les résidus (à faire une seule fois et stocker)
  const embeddings = await generateEmbeddings(
    Object.values(SimpleResidueLabels)
  );

  const residueEmbeddings: ResidueEmbedding[] = Object.keys(
    SimpleResidueLabels
  ).map((code, index) => ({
    code: code as SimpleResidue,
    embedding: embeddings[index],
  }));

  const newResidues = await Promise.all(
    (analysisExtraction.residues ?? []).map(async (residue) => {
      const reference = await resolveReference(
        residue.label,
        residueEmbeddings
      );

      return {
        ...residue,
        label: reference ? SimpleResidueLabels[reference] : residue.label,
        reference,
      };
    })
  );

  return {
    ...analysisExtraction,
    residues: newResidues,
  };
};

export const extractFromReport = async (
  reportDocumentId: string
): Promise<AnalyseExtraction> => {
  const content = await documentService.getDocumentContent(reportDocumentId);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini-2024-07-18',
    messages: extractAnalysisFromReportPrompt(content),
    response_format: zodResponseFormat(AnalyseExtraction, 'analysis'),
  });

  console.log(completion.choices[0].message.content);

  const analyseExtraction = JSON.parse(
    completion.choices[0].message.content ?? '{}'
  ) as AnalyseExtraction;

  return retrieveReferencesWithEmbeddings(analyseExtraction);
};
