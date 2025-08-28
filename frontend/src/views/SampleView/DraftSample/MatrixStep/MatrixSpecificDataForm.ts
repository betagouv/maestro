import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';

type ProgrammingPlanKeys<P extends ProgrammingPlanKind> = Exclude<
  keyof Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>,
  'programmingPlanKind'
>;

export const MatrixSpecificDataForm: {
  [P in ProgrammingPlanKind]: {
    [K in ProgrammingPlanKeys<P>]: { order: number };
  };
} = {
  PPV: {
    matrixDetails: { order: 1 },
    cultureKind: { order: 2 },
    matrixPart: { order: 3 },
    releaseControl: { order: 4 }
  },
  PFAS_EGGS: {
    species: { order: 1 },
    targetingCriteria: { order: 2 },
    notesOnTargetingCriteria: { order: 3 },
    animalKind: { order: 4 },
    animalIdentifier: { order: 5 },
    breedingMethod: { order: 6 },
    age: { order: 7 },
    sex: { order: 8 },
    seizure: { order: 9 },
    outdoorAccess: { order: 10 }
  },
  PFAS_MEAT: {
    species: { order: 1 },
    targetingCriteria: { order: 2 },
    notesOnTargetingCriteria: { order: 3 },
    animalKind: { order: 4 },
    animalIdentifier: { order: 5 },
    breedingMethod: { order: 6 },
    age: { order: 7 },
    sex: { order: 8 },
    seizure: { order: 9 },
    outdoorAccess: { order: 10 },
    killingCode: { order: 11 },
    productionKind: { order: 12 }
  },
  DAOA_BREEDING: {
    killingCode: { order: 1 },
    animalIdentifier: { order: 2 },
    species: { order: 3 }
  },
  DAOA_SLAUGHTER: {
    killingCode: { order: 1 },
    animalIdentifier: { order: 2 },
    animalKind: { order: 3 },
    productionKind: { order: 4 },
    sex: { order: 5 },
    age: { order: 6 }
  }
};
