import { z } from 'zod';
import { CreatedSampleData } from '../Sample/Sample';
import { getSampleItemReference } from '../Sample/SampleItem';

export const DocumentKind = z.enum([
  'SupportDocument',
  'AnalysisReportDocument',
  'AnalysisRequestDocument',
  'SampleDocument',
  'ProgrammingPlanNotice',
  'TechnicalInstruction',
  'OtherResourceDocument'
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
  'AnalysisReportDocument',
  'SampleDocument',
  'ProgrammingPlanNotice',
  'TechnicalInstruction',
  'OtherResourceDocument'
];

export type DocumentKind = z.infer<typeof DocumentKind>;

export const DocumentKindLabels: Partial<Record<DocumentKind, string>> = {
  ProgrammingPlanNotice: 'Fiche de plan',
  TechnicalInstruction: 'Instruction technique',
  OtherResourceDocument: 'Autre'
};

export const ResourceDocumentKindList: DocumentKind[] = [
  'ProgrammingPlanNotice',
  'TechnicalInstruction',
  'OtherResourceDocument'
];

export const SortedResourceDocumentKindList: DocumentKind[] = (
  [
    'ProgrammingPlanNotice',
    'TechnicalInstruction',
    'OtherResourceDocument'
  ] as DocumentKind[]
).sort((a, b) => {
  return (DocumentKindLabels[a as DocumentKind] || a).localeCompare(
    DocumentKindLabels[b as DocumentKind] || b
  );
});
