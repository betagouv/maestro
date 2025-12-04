import { FrIconClassName } from '@codegouvfr/react-dsfr';
import { cx } from '@codegouvfr/react-dsfr/fr/cx';
import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import { SampleMatrixSpecificData } from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';

type ProgrammingPlanKeys<P extends ProgrammingPlanKind> = Exclude<
  keyof Extract<SampleMatrixSpecificData, { programmingPlanKind: P }>,
  'programmingPlanKind'
>;

export type MatrixSpecificDataFormInputProps = {
  preTitle?: string;
  iconId?: FrIconClassName;
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
    killingCode: {
      preTitle: 'Animal',
      iconId: 'fr-icon-bug-line',
      classes: { container: cx('fr-col-offset-sm-6--right') }
    },
    animalIdentifier: {},
    species: {},
    productionMethod: {}
  },
  DAOA_SLAUGHTER: {
    killingCode: {
      preTitle: 'Animal',
      iconId: 'fr-icon-bug-line',
      classes: { container: cx('fr-col-offset-sm-6--right') }
    },
    animalIdentifier: {},
    animalKind: {},
    productionKind: {},
    sex: {},
    productionMethod: {},
    age: {}
  }
};
