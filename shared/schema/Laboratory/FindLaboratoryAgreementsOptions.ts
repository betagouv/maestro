import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const FindLaboratoryAgreementsOptions = z.object({
  programmingPlanKinds: z.array(ProgrammingPlanKind).nullish(),
  substanceKinds: z.array(SubstanceKind).nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  matrixKinds: z.array(MatrixKind).nullish(),
  withoutLab: z.boolean().nullish()
});

export type FindLaboratoryAgreementsOptions = z.infer<
  typeof FindLaboratoryAgreementsOptions
>;
