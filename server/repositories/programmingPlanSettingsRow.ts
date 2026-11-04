import type { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';

export type ProgrammingPlanSamplesJson = string & {
  __brand: 'ProgrammingPlanSamplesJson';
};

export type ProgrammingPlanStagesJson = string & {
  __brand: 'ProgrammingPlanStagesJson';
};

type JsonArraySettings = Partial<
  Pick<ProgrammingPlanSettings, 'samples' | 'stages'>
>;

export const toProgrammingPlanSettingsRow = <T extends JsonArraySettings>({
  samples,
  stages,
  ...row
}: T) => ({
  ...row,
  ...(samples !== undefined && {
    samples: samples && (JSON.stringify(samples) as ProgrammingPlanSamplesJson)
  }),
  ...(stages !== undefined && {
    stages: stages && (JSON.stringify(stages) as ProgrammingPlanStagesJson)
  })
});

export type ProgrammingPlanSettingsRow<T extends JsonArraySettings> =
  ReturnType<typeof toProgrammingPlanSettingsRow<T>>;
