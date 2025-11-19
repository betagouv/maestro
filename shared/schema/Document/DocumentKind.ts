import { z } from 'zod';
import { CreatedSampleData } from '../Sample/Sample';

export const DocumentKind = z.enum([
  'Resource',
  'SupportDocument',
  'AnalysisReportDocument',
  'AnalysisRequestDocument',
  'SampleDocument',
  'FicheDePlan',
  'InstructionTechnique'
]);

export const getSupportDocumentFilename = (
  sample: CreatedSampleData,
  copyNumber: number
) => `DAP-${sample.reference}-${copyNumber}.pdf`;

export const getAnalysisReportDocumentFilename = (
  sample: Pick<CreatedSampleData, 'reference'>,
  copyNumber: number,
  extension: 'xlsx' | 'csv'
) => `DAI-${sample.reference}-${copyNumber}.${extension}`;

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export const UploadDocumentKindList: DocumentKind[] = [
  'Resource',
  'AnalysisReportDocument',
  'SampleDocument',
  'FicheDePlan',
  'InstructionTechnique'
];

export type DocumentKind = z.infer<typeof DocumentKind>;

export const DocumentKindLabels: Partial<Record<DocumentKind, string>> = {
  FicheDePlan: 'Fiche de plan',
  InstructionTechnique: 'Instruction technique'
};

export const ResourceDocumentKindList: DocumentKind[] = (
  ['FicheDePlan', 'InstructionTechnique'] as DocumentKind[]
).sort((a, b) => {
  return (DocumentKindLabels[a as DocumentKind] || a).localeCompare(
    DocumentKindLabels[b as DocumentKind] || b
  );
});
