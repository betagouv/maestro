import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export type MatrixSpecificDataFormInputProps = {
  classes?: {
    container?: string[];
  };
};

export const MatrixSpecificDataForm: {
  [P in ProgrammingPlanKind]?: Record<string, MatrixSpecificDataFormInputProps>;
} = {
  PPV: {
    matrixDetails: { classes: { container: ['fr-col-sm-12', 'fr-pt-3w'] } }
  }
};
