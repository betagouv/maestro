import { z } from 'zod';
import { CreatedSampleData } from '../Sample/Sample';

export const DocumentKind = z.enum([
  'Resource',
  'SupportDocument',
  'AnalysisReportDocument',
  'AnalysisRequestDocument',
  'SampleDocument',
  'FicheDePlan'
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
  'SampleDocument'
];

export type DocumentKind = z.infer<typeof DocumentKind>;

export const DocumentKindLabels: Partial<Record<DocumentKind, string>> = {
  Resource: 'Ressource',
  FicheDePlan: 'Fiche de plan'
};
