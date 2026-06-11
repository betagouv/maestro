import { z } from 'zod';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKind } from '../Substance/SubstanceKind';
export const FindLaboratoryAgreementsOptions = z.object({
  year: z.coerce.number().int().nullish(),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  substanceKinds: z.array(SubstanceKind).nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  matrixKinds: z.array(MatrixKind).nullish(),
  withoutLab: z.boolean().nullish()
});
export type FindLaboratoryAgreementsOptions = z.infer<
  typeof FindLaboratoryAgreementsOptions
>;
