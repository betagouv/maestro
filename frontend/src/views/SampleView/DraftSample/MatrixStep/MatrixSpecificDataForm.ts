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
  label?: string;
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
    sampling: {
      preTitle: 'Animal',
      iconId: 'fr-icon-bug-line',
      classes: {}
    },
    animalIdentifier: {
      label: 'Identifiant du lot'
    },
    age: {
      label: 'Âge (en jours)'
    },
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
    age: {
      label: 'Âge (en mois)'
    },
    productionKind: {},
    outdoorAccess: {},
    seizure: {}
  }
};
