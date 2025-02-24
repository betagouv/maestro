import { z } from 'zod';
import { CreatedSampleData } from '../Sample/Sample';

export const DocumentKind = z.enum([
  'Resource',
  'SupportDocument',
  'AnalysisReportDocument',
  'AnalysisRequestDocument'
]);

export const getSupportDocumentFilename = (
  sample: CreatedSampleData,
  itemNumber: number
) => `DAP-${sample.reference}-${itemNumber}.pdf`;

export const getAnalysisReportDocumentFilename = (
  sample: CreatedSampleData,
  itemNumber: number,
  extension: 'xlsx' | 'csv'
) => `DAI-${sample.reference}-${itemNumber}.${extension}`;

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export type DocumentKind = z.infer<typeof DocumentKind>;
