import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';

export type ProgrammingPlanSamplesJson = string & {
  __brand: 'ProgrammingPlanSamplesJson';
};

export const toProgrammingPlanSettingsRow = <
  T extends Partial<Pick<ProgrammingPlanSettings, 'samples'>>
>({
  samples,
  ...row
}: T) => ({
  ...row,
  ...(samples !== undefined && {
    samples: samples && (JSON.stringify(samples) as ProgrammingPlanSamplesJson)
  })
});

export type ProgrammingPlanSettingsRow<
  T extends Partial<Pick<ProgrammingPlanSettings, 'samples'>>
> = ReturnType<typeof toProgrammingPlanSettingsRow<T>>;
