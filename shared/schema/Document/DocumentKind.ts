import { z } from 'zod';
import type { CreatedSampleData } from '../Sample/Sample';
import { getSampleItemReference } from '../Sample/SampleItem';

export const DocumentKind = z.enum(
  [
    'SupportDocument',
    'AnalysisReportDocument',
    'AnalysisRequestDocument',
    'SampleDocument',
    'ProgrammingPlanNotice',
    'TechnicalInstruction',
    'OtherResourceDocument',
    'RaiSourceFile',
    'RegulationResourceDocument',
    'TemplateResourceDocument'
  ],
  {
    error: () => 'Veuillez renseigner le type de document.'
  }
);

export const getSupportDocumentFilename = (
  sample: CreatedSampleData,
  itemNumber: number,
  copyNumber: number
) => `DAP-${getSampleItemReference(sample, itemNumber, copyNumber)}.pdf`;

export const getAnalysisReportDocumentFilename = (
  sample: Pick<CreatedSampleData, 'reference'>,
  extension: 'xlsx' | 'csv'
) => `DAI-${sample.reference}.${extension}`;

export type DocumentKind = z.infer<typeof DocumentKind>;

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export const ResourceDocumentKind = DocumentKind.extract([
  'ProgrammingPlanNotice',
  'TechnicalInstruction',
  'RegulationResourceDocument',
  'TemplateResourceDocument',
  'OtherResourceDocument'
]);

export type ResourceDocumentKind = z.infer<typeof ResourceDocumentKind>;

export const ResourceDocumentKindList: DocumentKind[] =
  ResourceDocumentKind.options;

export const DocumentKindLabels: Partial<Record<DocumentKind, string>> = {
  ProgrammingPlanNotice: 'Fiche de plan',
  TechnicalInstruction: 'Instruction technique',
  OtherResourceDocument: 'Autre',
  RaiSourceFile: 'Fichier source RAI',
  RegulationResourceDocument: 'Règlementation',
  TemplateResourceDocument: 'Modèle'
};

export const SortedResourceDocumentKindList: DocumentKind[] = [
  ...ResourceDocumentKindList
].sort((a, b) =>
  (DocumentKindLabels[a] || a).localeCompare(DocumentKindLabels[b] || b)
);
