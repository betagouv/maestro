import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { Pagination } from '../commons/Pagination';
import { Context } from '../ProgrammingPlan/Context';
import { SampleStatus } from './SampleStatus';

export const SampleCompliance = z.enum(['conform', 'notConform']);

export const SampleComplianceLabels = {
  conform: 'Conforme',
  notConform: 'Non conforme'
} as const satisfies Record<z.infer<typeof SampleCompliance>, string>;

export const FindSampleOptions = z
  .object({
    programmingPlanId: z.string().uuid(),
    context: Context.nullish(),
    region: Region.nullish(),
    department: Department.nullish(),
    status: z
      .union([SampleStatus, coerceToArray(z.array(SampleStatus))])
      .nullish(),
    matrix: Matrix.nullish(),
    sampledBy: z.string().uuid().nullish(),
    sampledAt: z.string().nullish(),
    reference: z.string().nullish(),
    compliance: SampleCompliance.nullish()
  })
  .merge(Pagination.partial());

export type FindSampleOptions = z.infer<typeof FindSampleOptions>;
