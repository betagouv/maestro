import { ProgrammingPlanKind } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';

export type SpecificDataFormInputProps = {
  classes?: {
    container?: string[];
  };
};

export const SpecificDataForm: {
  [P in ProgrammingPlanKind]?: Record<string, SpecificDataFormInputProps>;
} = {
  PPV: {
    matrixDetails: { classes: { container: ['fr-col-sm-12', 'fr-pt-3w'] } }
  }
};
