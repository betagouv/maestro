import { z } from 'zod';
import { coerceToArray } from '../../utils/utils';
import { Pagination } from '../commons/Pagination';
import { Department } from '../Department';
import { Region } from '../Region';
import { SampleStatus } from './SampleStatus';

export const FindSampleOptions = z
  .object({
    programmingPlanId: z.string().uuid().optional().nullable(),
    region: Region.optional().nullable(),
    department: Department.optional().nullable(),
    status: z
      .union([SampleStatus, coerceToArray(z.array(SampleStatus))])
      .optional()
      .nullable(),
  })
  .merge(Pagination.partial());

export type FindSampleOptions = z.infer<typeof FindSampleOptions>;
