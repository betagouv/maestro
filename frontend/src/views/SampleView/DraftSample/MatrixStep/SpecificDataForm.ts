import {
  isPPVSubPlanNumber,
  PPVSubPlanNumberPrefix
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
export type SpecificDataFormInputProps = {
  classes?: {
    container?: string[];
  };
};

export const SpecificDataForm: Record<
  string,
  Record<string, SpecificDataFormInputProps> | undefined
> = {
  PPV: {
    matrixDetails: { classes: { container: ['fr-col-sm-12'] } }
  }
};

export const specificDataFormLayout = (subPlanNumber?: string | null) =>
  SpecificDataForm[
    isPPVSubPlanNumber(subPlanNumber)
      ? PPVSubPlanNumberPrefix
      : (subPlanNumber ?? '')
  ];
