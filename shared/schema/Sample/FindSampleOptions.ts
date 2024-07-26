import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { Pagination } from '../commons/Pagination';
import { SampleStatus } from './SampleStatus';

export const FindSampleOptions = z
  .object({
    programmingPlanId: z.string().uuid().nullish(),
    region: Region.nullish(),
    department: Department.nullish(),
    status: z
      .union([SampleStatus, coerceToArray(z.array(SampleStatus))])
      .nullish(),
    matrix: Matrix.nullish(),
  })
  .merge(Pagination.partial());

export type FindSampleOptions = z.infer<typeof FindSampleOptions>;
