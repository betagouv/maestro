import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';

type ProgrammingPlanKeys<P extends ProgrammingPlanKind> = Exclude<
  keyof Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>,
  'programmingPlanKind'
>;

export type MatrixSpecificDataFormInputProps = {
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
    matrixDetails: { classes: { container: cx('fr-col-sm-12', 'fr-pt-3w') } },
    cultureKind: {},
    matrixPart: {},
    releaseControl: {}
  },
  DAOA_BREEDING: {
    killingCode: {},
    animalIdentifier: {},
    species: {},
    productionMethod: {}
  },
  DAOA_SLAUGHTER: {
    killingCode: {},
    animalIdentifier: {},
    animalKind: {},
    productionKind: {},
    sex: {},
    productionMethod: {},
    age: {}
  }
};
