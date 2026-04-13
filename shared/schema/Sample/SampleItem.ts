import { isNil } from 'lodash-es';
import { z } from 'zod';
import { QuantityUnit } from '../../referential/QuantityUnit';
import { maestroDateRefined } from '../../utils/date';
import { isDefinedAndNotNull } from '../../utils/utils';
import {
  AnalysisStatus,
  AnalysisStatusPriority
} from '../Analysis/AnalysisStatus';
import { SubstanceKind } from '../Substance/SubstanceKind';
import type { SampleChecked } from './Sample';
import { SampleItemRecipientKind } from './SampleItemRecipientKind';

export const SampleItemKey = z.object({
  sampleId: z.guid(),
  itemNumber: z.coerce.number().int().positive(),
  copyNumber: z.coerce.number().int().positive()
});

export type SampleItemKey = z.infer<typeof SampleItemKey>;

export const SampleItem = z.object({
  ...SampleItemKey.shape,
  quantity: z
    .number({
      error: (issue) =>
        isNil(issue.input) ? 'Veuillez renseigner la quantité.' : issue.message
    })
    .nonnegative('La quantité doit être positive.'),
  quantityUnit: QuantityUnit,
  compliance200263: z.boolean({
    error: (issue) =>
      isNil(issue.input)
        ? "Veuillez renseigner si l'échantillon respecte la directive 2002/63"
        : issue.message
  }),
  sealId: z
    .string({
      error: (issue) =>
        isNil(issue.input)
          ? 'Veuillez renseigner le numéro de scellé.'
          : issue.message
    })
    .min(1, 'Veuillez renseigner le numéro de scellé.'),
  supportDocumentId: z.guid().nullish(),
  recipientKind: SampleItemRecipientKind,
  laboratoryId: z
    .guid({
      error: () =>
        "Veuillez renseigner le laboratoire destinataire de l'échantillon."
    })
    .nullish(),
  substanceKind: SubstanceKind,
  receiptDate: maestroDateRefined.nullish(),
  notesOnAdmissibility: z.string().nullish(),
  shippingDate: maestroDateRefined.nullish(),
  destructionDate: maestroDateRefined.nullish(),
  carrier: z.string().nullish(),
  invoicingDate: maestroDateRefined.nullish(),
  paid: z.boolean().nullish(),
  paidDate: maestroDateRefined.nullish(),
  invoiceNumber: z.string().nullish(),
  budgetNotes: z.string().nullish(),
  complianceOverride: z.boolean().nullish(),
  analysis: z
    .object({
      status: AnalysisStatus,
      compliance: z.boolean().nullish(),
      notesOnCompliance: z.string().nullish()
    })
    .nullish()
});

export const PartialSampleItem = z.object({
  ...SampleItem.partial().shape,
  ...SampleItem.pick({
    sampleId: true,
    itemNumber: true,
    copyNumber: true
  }).shape,
  sealId: z.string().nullish()
});

const SampleAnalysisDataItemUpdate = z.object({
  updateKey: z.literal('analysis'),
  ...SampleItem.pick({
    receiptDate: true,
    notesOnAdmissibility: true,
    complianceOverride: true,
    analysis: true
  }).shape,
  isAdmissible: z.boolean().nullish()
});

const SampleBillingDataItemUpdate = z.object({
  updateKey: z.literal('billing'),
  ...SampleItem.pick({
    invoicingDate: true,
    paid: true,
    paidDate: true,
    invoiceNumber: true,
    budgetNotes: true
  }).shape,
  isAdmissible: z.boolean().nullish()
});

const SampleShippingDataUpdate = z.object({
  updateKey: z.literal('shipping'),
  ...SampleItem.pick({
    shippingDate: true,
    destructionDate: true,
    carrier: true
  }).shape
});

export const SampleItemUpdate = z.discriminatedUnion('updateKey', [
  SampleAnalysisDataItemUpdate,
  SampleBillingDataItemUpdate,
  SampleShippingDataUpdate
]);

export type SampleItem = z.infer<typeof SampleItem>;
export type PartialSampleItem = z.infer<typeof PartialSampleItem>;
export type SampleItemUpdate = z.infer<typeof SampleItemUpdate>;

export const SampleItemSort = (a: PartialSampleItem, b: PartialSampleItem) =>
  a.itemNumber === b.itemNumber
    ? a.copyNumber - b.copyNumber
    : a.itemNumber - b.itemNumber;

export const SampleItemMaxCopyCount = 3;

export const getSampleItemReference = (
  sample: Pick<SampleChecked, 'reference'>,
  itemNumber: number,
  copyNumber: number
) =>
  [sample.reference, String.fromCharCode(64 + itemNumber), copyNumber]
    .filter(isDefinedAndNotNull)
    .join('-');

const getCompliantCopies = (sampleItemCopies: SampleItem[]) =>
  sampleItemCopies.filter(
    (copy) =>
      copy.analysis?.status === 'Completed' &&
      copy.analysis?.compliance === true
  );

export const getNonCompliantCopies = (sampleItemCopies: SampleItem[]) =>
  sampleItemCopies.filter(
    (copy) =>
      copy.analysis?.status === 'Completed' &&
      copy.analysis?.compliance === false
  );

export const isItemAchieved = (sampleItemCopies: SampleItem[]) =>
  sampleItemCopies.every(
    (copy) =>
      isNil(copy.analysis) ||
      ['Completed', 'Unused'].includes(copy.analysis.status)
  );

export const isItemCompliant = (sampleItemCopies: SampleItem[]) => {
  const complianceOverride = sampleItemCopies.find(
    (_) => _.copyNumber === 1
  )?.complianceOverride;
  if (!isItemAchieved(sampleItemCopies)) {
    return null;
  }
  if (isNil(complianceOverride)) {
    return (
      getCompliantCopies(sampleItemCopies).length > 0 &&
      getNonCompliantCopies(sampleItemCopies).length === 0
    );
  }
  return complianceOverride;
};

export const getItemStatus = (sampleItemCopies: SampleItem[]): AnalysisStatus =>
  sampleItemCopies
    .map((copy) => copy.analysis?.status)
    .filter((status): status is AnalysisStatus => status !== undefined)
    .reduce(
      (worst, status) =>
        AnalysisStatusPriority[status] > AnalysisStatusPriority[worst]
          ? status
          : worst,
      'Completed' as AnalysisStatus
    );
