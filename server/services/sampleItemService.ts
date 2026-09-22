import type { ProgrammingPlanSampleSetting } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { PartialSampleItem } from 'maestro-shared/schema/Sample/SampleItem';

export const buildSampleItems = (
  sampleId: string,
  samples: ProgrammingPlanSampleSetting[],
  { withOptionalCopies }: { withOptionalCopies: boolean }
): PartialSampleItem[] =>
  samples.flatMap((sample, sampleIndex) =>
    sample.copies.flatMap((copy, copyIndex) =>
      copy.required || withOptionalCopies
        ? [
            {
              sampleId,
              itemNumber: sampleIndex + 1,
              copyNumber: copyIndex + 1,
              recipientKind:
                copy.recipientKinds.length === 1
                  ? copy.recipientKinds[0]
                  : undefined,
              substanceKinds: sample.substanceKinds
            }
          ]
        : []
    )
  );
