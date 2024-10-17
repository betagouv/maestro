import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import z from 'zod';
import { OptionalBoolean } from '../../../shared/referential/OptionnalBoolean';
import { Analyte } from '../../../shared/referential/Residue/Analyte';
import { AnalyteLabels } from '../../../shared/referential/Residue/AnalyteLabels';
import { ComplexResidue } from '../../../shared/referential/Residue/ComplexResidue';
import { ComplexResidueAnalytes } from '../../../shared/referential/Residue/ComplexResidueAnalytes';
import { ComplexResidueLabels } from '../../../shared/referential/Residue/ComplexResidueLabels';
import { SimpleResidue } from '../../../shared/referential/Residue/SimpleResidue';
import { SimpleResidueLabels } from '../../../shared/referential/Residue/SimpleResidueLabels';
import { ResidueCompliance } from '../../../shared/schema/Analysis/Residue/ResidueCompliance';
import { ResidueKind } from '../../../shared/schema/Analysis/Residue/ResidueKind';
import {
  ResultKind,
  ResultKindLabels,
} from '../../../shared/schema/Analysis/Residue/ResultKind';
import { extractAnalysisFromReportPrompt } from '../../prompts/extractAnalysisFromReport.prompt';
import config from '../../utils/config';
import {
  generateEmbeddings,
  ReferenceEmbedding,
  resolveReferenceWithEmbeddings,
} from '../aiService/aiService';
import documentService from '../documentService/documentService';
const openai = new OpenAI({
  apiKey: config.apis.openai.apiKey,
});

const AnalyteExtraction = z.object({
  analyteNumber: z.number().int(),
  label: z.string(),
  reference: z.string().nullish(),
  resultKind: ResultKind.describe(ResultKindLabels.toString()),
  result: z.number().nullish(),
});

export const ResidueExtraction = z.object({
  originalName: z
    .string()
    .nullish()
    .describe('The name of the residue as it appears in the report'),
  // reference: z.string().nullish(),
  residueNumber: z.number().int(),
  kind: ResidueKind,
  resultKind: ResultKind.nullish().describe(ResultKindLabels.toString()),
  result: z.number().nullish().describe('Result when resultKind is Q'),
  lmr: z
    .number()
    .nullish()
    .describe(
      'LMR when resultKind is Q. Not the LQ value. This can be defined by a max value called specifications'
    ),
  resultHigherThanArfd: OptionalBoolean,
  notesOnResult: z.string().nullish(),
  substanceApproved: OptionalBoolean,
  substanceAuthorised: OptionalBoolean,
  pollutionRisk: OptionalBoolean.nullish(),
  notesOnPollutionRisk: z.string().nullish(),
  compliance: ResidueCompliance,
  analytes: z
    .array(AnalyteExtraction)
    .nullish()
    .describe(
      'Only for complex residue. Contains the list of the sub residues.'
    ),
});

export const AnalysisExtraction = z.object({
  kind: z.enum(['Mono', 'Multi']).optional(),
  residues: z
    .array(ResidueExtraction)
    .optional()
    //  .default([])
    .describe(
      'Contains only the residues of pesticides that were detected in the sample. (Residues marked as "ND" are not included.)'
    ),
  compliance: z.boolean().optional(),
  notesOnCompliance: z.string().nullable().optional(),
});

export type AnalyseExtraction = z.infer<typeof AnalysisExtraction>;
type ResidueExtraction = z.infer<typeof ResidueExtraction>;
type AnalyteExtraction = z.infer<typeof AnalyteExtraction>;

const retrieveAnalytesReferences = async (
  residue: ResidueExtraction,
  reference: ComplexResidue
): Promise<ResidueExtraction> => {
  const complexResidueAnalyteLabels = ComplexResidueAnalytes[reference].map(
    (analyte) => AnalyteLabels[analyte]
  );

  const analytesEmbeddings: ReferenceEmbedding<Analyte>[] =
    await generateEmbeddings(complexResidueAnalyteLabels).then((embeddings) =>
      embeddings.map((embedding, index) => ({
        reference: ComplexResidueAnalytes[reference][index],
        embedding,
      }))
    );

  const newAnalytes = await Promise.all(
    (residue.analytes ?? []).map(async (analyte) => {
      const reference = await resolveReferenceWithEmbeddings<Analyte>(
        analyte.label,
        analytesEmbeddings
      );

      return {
        ...analyte,
        label: reference ? AnalyteLabels[reference as Analyte] : analyte.label,
        reference,
      };
    })
  );

  return {
    ...residue,
    analytes: newAnalytes,
  };
};

const retrieveResiduesReferences = async (
  analysisExtraction: AnalyseExtraction
): Promise<AnalyseExtraction> => {
  // Génération des embeddings pour les résidus (à faire une seule fois et stocker)
  const simpleResidueEmbeddings: ReferenceEmbedding<SimpleResidue>[] =
    await generateEmbeddings(Object.values(SimpleResidueLabels)).then(
      (embeddings) =>
        embeddings.map((embedding, index) => ({
          reference: Object.keys(SimpleResidueLabels)[index] as SimpleResidue,
          embedding,
        }))
    );
  const complexResidueEmbeddings: ReferenceEmbedding<ComplexResidue>[] =
    await generateEmbeddings(Object.values(ComplexResidueLabels)).then(
      (embeddings) =>
        embeddings.map((embedding, index) => ({
          reference: Object.keys(ComplexResidueLabels)[index] as ComplexResidue,
          embedding,
        }))
    );

  const newResidues = await Promise.all(
    (analysisExtraction.residues ?? []).map(async (residue) => {
      const reference = residue.originalName
        ? await resolveReferenceWithEmbeddings(residue.originalName, [
            ...simpleResidueEmbeddings,
            ...complexResidueEmbeddings,
          ])
        : undefined;

      const residueWithAnalyte = ComplexResidue.safeParse(reference).success
        ? await retrieveAnalytesReferences(residue, reference as ComplexResidue)
        : residue;

      return {
        ...residueWithAnalyte,
        label: SimpleResidue.safeParse(reference).success
          ? SimpleResidueLabels[reference as SimpleResidue]
          : ComplexResidue.safeParse(reference).success
          ? ComplexResidueLabels[reference as ComplexResidue]
          : (reference as string),
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
    model: config.apis.openai.models.analysisExtraction,
    messages: extractAnalysisFromReportPrompt(content),
    response_format: zodResponseFormat(AnalysisExtraction, 'analysis'),
  });

  console.log(completion.choices[0].message.content);

  const analyseExtraction = JSON.parse(
    completion.choices[0].message.content ?? '{}'
  ) as AnalyseExtraction;

  return retrieveResiduesReferences(analyseExtraction);
};
