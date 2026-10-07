import { z } from 'zod';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const SubPlanSubstances = z.partialRecord(
  SubstanceKind.extract(['Mono', 'Multi']),
  z.array(SSD2Id)
);
export type SubPlanSubstances = z.infer<typeof SubPlanSubstances>;
