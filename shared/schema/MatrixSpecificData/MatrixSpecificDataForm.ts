import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from '../Sample/SampleMatrixSpecificData';

export type ProgrammingPlanKeys<P extends ProgrammingPlanKind> = Exclude<
  keyof Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>,
  'programmingPlanKind'
>;

export type MatrixSpecificDataFormInputProps = {
  preTitle?: string;
  label?: string;
  iconId?: string;
  position?: 'pre' | 'post';
  classes?: {
    container?: string[];
  };
};

export const MatrixSpecificDataForm: {
  [P in ProgrammingPlanKind]: {
    [K in ProgrammingPlanKeys<P>]: MatrixSpecificDataFormInputProps;
  };
} = {
  PPV: {
    matrixDetails: { classes: { container: ['fr-col-sm-12', 'fr-pt-3w'] } },
    cultureKind: {},
    matrixPart: {},
    releaseControl: {}
  },
  DAOA_BREEDING: {
    sampling: {
      preTitle: 'Animal',
      iconId: 'fr-icon-bug-line',
      classes: {}
    },
    animalIdentifier: {
      label: 'Identifiant du lot'
    },
    ageInDays: {},
    species: {},
    breedingMethod: {},
    outdoorAccess: {}
  },
  DAOA_SLAUGHTER: {
    killingCode: {
      preTitle: 'Animal',
      iconId: 'fr-icon-bug-line'
    },
    sampling: {},
    animalIdentifier: {
      label: "Identifiant de l'animal"
    },
    animalKind: {},
    sex: {},
    ageInMonths: {},
    productionKind: {},
    outdoorAccess: {},
    seizure: {}
  }
};
