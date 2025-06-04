import { z } from 'zod/v4';
import { Region } from '../../referential/Region';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlanRegionalStatus = z.object({
  status: ProgrammingPlanStatus,
  region: Region
});

export type ProgrammingPlanRegionalStatus = z.infer<
  typeof ProgrammingPlanRegionalStatus
>;
