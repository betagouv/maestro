import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';

type ProgrammingPlanKeys<P extends ProgrammingPlanKind> = Exclude<
  keyof Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>,
  'programmingPlanKind'
>;

export type MatrixSpecificDataFormInputProps = {
  order: number;
  preTitle?: string;
  position?: 'pre' | 'post';
  classes?: {
    container?: string;
  };
};

export const MatrixSpecificDataForm: {
  [P in ProgrammingPlanKind]: {
    [K in ProgrammingPlanKeys<P>]: MatrixSpecificDataFormInputProps;
  };
} = {
  PPV: {
    matrixDetails: { order: 1 },
    cultureKind: { order: 2 },
    matrixPart: { order: 3 },
    releaseControl: { order: 4 }
  },
  PFAS_EGGS: {
    species: {
      order: 1,
      position: 'pre',
      classes: { container: cx('fr-col-offset-sm-6--right') }
    },
    targetingCriteria: { order: 2 },
    notesOnTargetingCriteria: { order: 3 },
    animalKind: {
      order: 4,
      preTitle: 'Animal',
      classes: { container: cx('fr-col-offset-sm-6--right') }
    },
    animalIdentifier: { order: 5 },
    breedingMethod: { order: 6 },
    age: { order: 7 },
    sex: { order: 8 },
    seizure: { order: 9 },
    outdoorAccess: { order: 10 }
  },
  PFAS_MEAT: {
    species: {
      order: 1,
      position: 'pre',
      classes: { container: cx('fr-col-offset-sm-6--right') }
    },
    killingCode: { order: 2 },
    targetingCriteria: { order: 3 },
    notesOnTargetingCriteria: { order: 4 },
    animalKind: {
      order: 5,
      preTitle: 'Animal'
    },
    productionKind: { order: 6 },
    animalIdentifier: { order: 7 },
    breedingMethod: { order: 8 },
    age: { order: 9 },
    sex: { order: 10 },
    seizure: { order: 11 },
    outdoorAccess: { order: 12 }
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
