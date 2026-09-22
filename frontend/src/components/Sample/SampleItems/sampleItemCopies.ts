import type { ProgrammingPlanSampleSetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import {
  type PartialSampleItem,
  SampleItemMaxCopyCount
} from 'maestro-shared/schema/Sample/SampleItem';
import type { SampleItemRecipientKind } from 'maestro-shared/schema/Sample/SampleItemRecipientKind';

type Copy = Pick<PartialSampleItem, 'itemNumber' | 'copyNumber'>;

const copySetting = (
  samples: ProgrammingPlanSampleSetting[],
  { itemNumber, copyNumber }: Copy
) => samples[itemNumber - 1]?.copies[copyNumber - 1];

export const copyRecipientKinds = (
  samples: ProgrammingPlanSampleSetting[],
  copy: Copy
): SampleItemRecipientKind[] =>
  copySetting(samples, copy)?.recipientKinds ?? ['Operator', 'Sampler'];

const oppositeRecipientKind = (
  recipientKind: SampleItemRecipientKind | undefined
): SampleItemRecipientKind | undefined => {
  switch (recipientKind) {
    case 'Sampler':
      return 'Operator';
    case 'Operator':
      return 'Sampler';
    default:
      return undefined;
  }
};

export const defaultCopyRecipientKind = (
  samples: ProgrammingPlanSampleSetting[],
  items: PartialSampleItem[],
  copy: Copy
): SampleItemRecipientKind | undefined => {
  const recipientKinds = copyRecipientKinds(samples, copy);
  if (recipientKinds.length === 1) {
    return recipientKinds[0];
  }
  return copy.copyNumber === 3
    ? oppositeRecipientKind(
        items.find(
          (item) => item.itemNumber === copy.itemNumber && item.copyNumber === 2
        )?.recipientKind
      )
    : undefined;
};

export const nextCopyNumber = (
  items: PartialSampleItem[],
  itemNumber: number
): number | undefined =>
  Array.from({ length: SampleItemMaxCopyCount }, (_, index) => index + 1).find(
    (copyNumber) =>
      !items.some(
        (item) =>
          item.itemNumber === itemNumber && item.copyNumber === copyNumber
      )
  );

const isRequiredCopy = (samples: ProgrammingPlanSampleSetting[], copy: Copy) =>
  copy.copyNumber === 1 || (copySetting(samples, copy)?.required ?? false);

export const isRemovableCopy = (
  samples: ProgrammingPlanSampleSetting[],
  items: PartialSampleItem[],
  copy: Copy
): boolean =>
  !isRequiredCopy(samples, copy) &&
  !items.some(
    (item) =>
      item.itemNumber === copy.itemNumber &&
      item.copyNumber > copy.copyNumber &&
      !isRequiredCopy(samples, item)
  );
