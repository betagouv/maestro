import { uniq } from 'lodash-es';
import {
  SampleMatrixSpecificDataKeys,
  SpecificDataFormInput
} from 'maestro-shared/schema/MatrixSpecificData/MatrixSpecificDataFormInputs';
import { ProgrammingPlanKindWithSacha } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanKind';
import {
  getSampleMatrixSpecificDataAttributeValues,
  schemasByProgrammingPlanKind
} from 'maestro-shared/schema/Sample/SampleMatrixSpecificData';

export const getAllSachaAttributes = (): SampleMatrixSpecificDataKeys[] =>
  uniq(
    ProgrammingPlanKindWithSacha.options.flatMap((kind) =>
      Object.keys(schemasByProgrammingPlanKind[kind].shape)
    )
  ).filter(
    (key): key is SampleMatrixSpecificDataKeys => key !== 'programmingPlanKind'
  );

export const getAttributeExpectedValues = (
  attribute: SampleMatrixSpecificDataKeys
): string[] =>
  uniq(
    ProgrammingPlanKindWithSacha.options.flatMap((p) =>
      getSampleMatrixSpecificDataAttributeValues(p, attribute)
    )
  );

export const canHaveValue = (
  inputConf: SpecificDataFormInput
): inputConf is Extract<
  SpecificDataFormInput,
  { inputType: 'select' | 'radio' }
> => inputConf.inputType === 'select' || inputConf.inputType === 'radio';
