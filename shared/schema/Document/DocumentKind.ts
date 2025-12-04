import { z } from 'zod';
import { CreatedSampleData } from '../Sample/Sample';
import { getSampleItemReference } from '../Sample/SampleItem';

export const DocumentKind = z.enum([
  'Resource',
  'SupportDocument',
  'AnalysisReportDocument',
  'AnalysisRequestDocument',
  'SampleDocument'
]);

export const getSupportDocumentFilename = (
  sample: CreatedSampleData,
  itemNumber: number,
  copyNumber: number
) => `DAP-${getSampleItemReference(sample, itemNumber, copyNumber)}.pdf`;

export const getAnalysisReportDocumentFilename = (
  sample: Pick<CreatedSampleData, 'reference'>,
  itemNumber: number,
  copyNumber: number,
  extension: 'xlsx' | 'csv'
) =>
  `DAI-${getSampleItemReference(sample, itemNumber, copyNumber)}.${extension}`;

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export const UploadDocumentKindList: DocumentKind[] = [
  'Resource',
  'AnalysisReportDocument',
  'SampleDocument'
];

export type DocumentKind = z.infer<typeof DocumentKind>;
