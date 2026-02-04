import { isNil } from 'lodash-es';
import { z } from 'zod';
import { QuantityUnit } from '../../referential/QuantityUnit';
import { isDefinedAndNotNull } from '../../utils/utils';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { SampleChecked } from './Sample';
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
  sealId: z.string().nullish(),
  supportDocumentId: z.guid().nullish(),
  recipientKind: SampleItemRecipientKind,
  laboratoryId: z
    .guid({
      error: () =>
        "Veuillez renseigner le laboratoire destinataire de l'échantillon."
    })
    .nullish(),
  substanceKind: SubstanceKind
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

export type SampleItem = z.infer<typeof SampleItem>;
export type PartialSampleItem = z.infer<typeof PartialSampleItem>;

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
