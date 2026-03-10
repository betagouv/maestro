import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from '../Sample/SampleMatrixSpecificData';

type ProgrammingPlanKeys<P extends ProgrammingPlanKind> = Exclude<
  keyof Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>,
  'programmingPlanKind'
>;

export type MatrixSpecificDataFormInputProps = {
  preTitle?: string;
  label?: string;
  iconId?: string;
  position?: 'pre' | 'post';
  colSm?: 2 | 3 | 4 | 6 | 12;
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
    productionKind: {},
    matrixPart: {},
    releaseControl: {}
  },
  DAOA_VOLAILLE: {
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
    outdoorAccess: { colSm: 4 }
  },
  DAOA_BOVIN: {
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
    outdoorAccess: { colSm: 4 },
    seizure: {}
  }
};
