import { z } from 'zod';
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

export type AnalysisReportDocumentExtension = 'xlsx' | 'csv' | 'json'
export const getAnalysisReportDocumentFilename = (
  sample: CreatedSampleData,
  itemNumber: number,
  extension: AnalysisReportDocumentExtension
) => `DAI-${sample.reference}-${itemNumber}.${extension}`;

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export const UploadDocumentKindList: DocumentKind[] = [
  'Resource',
  'AnalysisReportDocument',
  'SampleDocument'
];

export type DocumentKind = z.infer<typeof DocumentKind>;
