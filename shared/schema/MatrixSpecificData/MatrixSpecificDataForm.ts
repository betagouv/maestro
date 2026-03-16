import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export type MatrixSpecificDataFormInputProps = {
  label?: string;
  classes?: {
    container?: string[];
  };
};

export const MatrixSpecificDataForm: {
  [P in ProgrammingPlanKind]: Record<string, MatrixSpecificDataFormInputProps>;
} = {
  PPV: {
    matrixDetails: { classes: { container: ['fr-col-sm-12', 'fr-pt-3w'] } }
  },
  DAOA_VOLAILLE: {
    animalIdentifier: {
      label: 'Identifiant du lot'
    }
  },
  DAOA_BOVIN: {
    animalIdentifier: {
      label: "Identifiant de l'animal"
    }
  }
};
