import {
  ALANProgrammingPlanFixture,
  DAOAInProgressProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  genProgrammingPlan,
  genProgrammingSubPlan,
  NationalCoordinatorId,
  PPVClosedProgrammingPlanFixture,
  PPVInProgressProgrammingPlanFixture,
  PPVStagesFixture,
  PPVSubmittedProgrammingPlanFixture,
  PPVValidatedDromProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import type { ProgrammingPlanDBChecked } from '../repositories/programmingPlanRepository';

export const genProgrammingPlanDB = (
  programmingPlan: Partial<ProgrammingPlanDBChecked>
): ProgrammingPlanDBChecked => {
  return {
    substanceKinds: null,
    substanceKindsManaged: false,
    samples: null,
    samplesManaged: false,
    matrices: null,
    matricesManaged: false,
    context: null,
    contextManaged: false,
    programmingInstruction: null,
    programmingInstructionManaged: false,
    notes: null,
    notesManaged: false,
    monoSubstances: null,
    monoSubstancesManaged: false,
    multiSubstances: null,
    multiSubstancesManaged: false,
    sampleProcedure: null,
    sampleProcedureManaged: false,
    delegated: null,
    delegatedManaged: false,
    stages: null,
    stagesManaged: false,
    ...genProgrammingPlan(programmingPlan),
    ...programmingPlan
  };
};
export const genDeletableProgrammingPlanDB = (
  data?: Partial<ProgrammingPlanDBChecked>
): ProgrammingPlanDBChecked => {
  const planId = data?.id ?? crypto.randomUUID();
  return genProgrammingPlanDB({
    settingsCompleted: false,
    createdBy: NationalCoordinatorId,
    subPlans: [
      genProgrammingSubPlan({
        programmingPlanId: planId,
        settingsCompleted: false
      })
    ],
    ...data,
    id: planId
  });
};

const ppvDefault: Pick<ProgrammingPlanDBChecked, 'stages' | 'stagesManaged'> = {
  stages: PPVStagesFixture,
  stagesManaged: true
} as const;
export const PPVSubmittedProgrammingPlanFixtureDB = genProgrammingPlanDB({
  ...PPVSubmittedProgrammingPlanFixture,
  ...ppvDefault
});

export const PPVInProgressProgrammingPlanFixtureDB = genProgrammingPlanDB({
  ...PPVInProgressProgrammingPlanFixture,
  ...ppvDefault
});

export const PPVClosedProgrammingPlanFixtureDB = genProgrammingPlanDB({
  ...PPVClosedProgrammingPlanFixture,
  ...ppvDefault
});

export const PPVValidatedDromProgrammingPlanFixtureDB = genProgrammingPlanDB({
  ...PPVValidatedDromProgrammingPlanFixture,
  ...ppvDefault
});

export const PPVValidatedProgrammingPlanFixtureDB = genProgrammingPlanDB({
  ...PPVValidatedProgrammingPlanFixture,
  ...ppvDefault
});
export const DAOAInProgressProgrammingPlanFixtureDB = genProgrammingPlanDB(
  DAOAInProgressProgrammingPlanFixture
);
export const DAOAValidatedProgrammingPlanFixtureDB = genProgrammingPlanDB(
  DAOAValidatedProgrammingPlanFixture
);
export const ALANProgrammingPlanFixtureDB = genProgrammingPlanDB(
  ALANProgrammingPlanFixture
);
