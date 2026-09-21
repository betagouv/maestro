import { last } from 'lodash-es';
import {
  defaultProgrammingPlanSample,
  ProgrammingPlanSampleMaxCount,
  type ProgrammingPlanSampleSetting
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import type { SubstanceKind } from 'maestro-shared/schema/Substance/SubstanceKind';

export const addProgrammingPlanSample = (
  samples: ProgrammingPlanSampleSetting[]
): ProgrammingPlanSampleSetting[] =>
  samples.length >= ProgrammingPlanSampleMaxCount
    ? samples
    : [
        ...samples,
        {
          substanceKinds: [],
          copies: (last(samples) ?? defaultProgrammingPlanSample).copies
        }
      ];

export const unassignedSubstanceKinds = (
  samples: ProgrammingPlanSampleSetting[],
  substanceKinds: SubstanceKind[]
): SubstanceKind[] =>
  substanceKinds.filter(
    (substanceKind) =>
      !samples.some((sample) => sample.substanceKinds.includes(substanceKind))
  );

export const toggleSampleSubstanceKind = (
  samples: ProgrammingPlanSampleSetting[],
  sampleIndex: number,
  substanceKind: SubstanceKind
): ProgrammingPlanSampleSetting[] => {
  const selected = !samples[sampleIndex].substanceKinds.includes(substanceKind);
  return samples.map((sample, index) => ({
    ...sample,
    substanceKinds: [
      ...sample.substanceKinds.filter((current) => current !== substanceKind),
      ...(selected && index === sampleIndex ? [substanceKind] : [])
    ]
  }));
};
