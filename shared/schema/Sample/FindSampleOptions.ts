import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Region } from '../../referential/Region';
import { Pagination } from '../commons/Pagination';
import { Context } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import {
  companiesIsRequired,
  departmentIsRequired,
  programmingPlanKindsIsRequired,
  type UserRefined
} from '../User/User';
import { isNationalRole, type UserRole } from '../User/UserRole';
import { SampleCompliance } from './SampleCompliance';
import { SampleStatus } from './SampleStatus';

export const FindSampleOptions = z.object({
  programmingPlanIds: z.array(z.guid()).nullish(),
  kinds: z.array(ProgrammingPlanKind).nullish(),
  contexts: z.array(Context).nullish(),
  regions: z.array(Region).nullish(),
  departments: z.array(Department).nullish(),
  companySirets: z.array(z.string()).nullish(),
  statuses: z.array(SampleStatus).nullish(),
  matrices: z.array(Matrix).nullish(),
  matrixKinds: z.array(MatrixKind).nullish(),
  sampledBy: z.array(z.guid()).nullish(),
  sampledDate: z.string().nullish(),
  reference: z.string().nullish(),
  compliance: SampleCompliance.nullish(),
  withAtLeastOneResidue: z.boolean().nullish(),
  withAtLeastOneCopiedItem: z.boolean().nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  prescriptionId: z.guid().nullish(),
  ...Pagination.partial().shape
});

export type FindSampleOptions = z.infer<typeof FindSampleOptions>;

export const buildFindSampleOptions = (
  user: UserRefined,
  userRole: UserRole,
  query: Partial<FindSampleOptions>
): FindSampleOptions => {
  const companySirets = companiesIsRequired(user)
    ? user.companies.map((company) => company.siret)
    : query.companySirets;

  return {
    ...query,
    regions: isNationalRole(userRole)
      ? query.regions
      : user.region
        ? [user.region]
        : undefined,
    departments: departmentIsRequired(user)
      ? [user.department as Department]
      : query.departments,
    companySirets,
    kinds: programmingPlanKindsIsRequired(user)
      ? user.programmingPlanKinds
      : query.kinds
  } as FindSampleOptions;
};
