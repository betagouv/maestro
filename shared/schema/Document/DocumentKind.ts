import { z } from 'zod/v4';
import { CreatedSampleData } from '../Sample/Sample';

export const DocumentKind = z.enum([
  'Resource',
  'SupportDocument',
  'AnalysisReportDocument',
  'AnalysisRequestDocument',
  'SampleDocument'
]);

export const getSupportDocumentFilename = (
  sample: CreatedSampleData,
  itemNumber: number
) => `DAP-${sample.reference}-${itemNumber}.pdf`;

export const getAnalysisReportDocumentFilename = (
  sample: Pick<CreatedSampleData, 'reference'>,
  itemNumber: number,
  extension: 'xlsx' | 'csv'
) => `DAI-${sample.reference}-${itemNumber}.${extension}`;

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export const UploadDocumentKindList: DocumentKind[] = [
  'Resource',
  'AnalysisReportDocument',
  'SampleDocument'
];

export type DocumentKind = z.infer<typeof DocumentKind>;
