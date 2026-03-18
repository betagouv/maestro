import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixKind } from '../../referential/Matrix/MatrixKind';
import { Region } from '../../referential/Region';
import { coerceToArray, coerceToBooleanNullish } from '../../utils/utils';
import { Pagination } from '../commons/Pagination';
import { Context } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import {
  companiesIsRequired,
  departmentIsRequired,
  programmingPlanKindsIsRequired,
  UserRefined
} from '../User/User';
import { isNationalRole, UserRole } from '../User/UserRole';
import { SampleStatus } from './SampleStatus';

export const SampleCompliance = z.enum(['conform', 'notConform']);

export const SampleComplianceLabels = {
  conform: 'Conforme',
  notConform: 'Non conforme'
} as const satisfies Record<z.infer<typeof SampleCompliance>, string>;

export const FindSampleOptions = z
  .object({
    programmingPlanIds: coerceToArray(z.array(z.guid())).nullish(),
    kinds: coerceToArray(z.array(ProgrammingPlanKind)).nullish(),
    contexts: coerceToArray(z.array(Context)).nullish(),
    region: Region.nullish(),
    departments: coerceToArray(z.array(Department)).nullish(),
    companySirets: coerceToArray(z.array(z.string())).nullish(),
    status: z
      .union([SampleStatus, coerceToArray(z.array(SampleStatus))])
      .nullish(),
    matrix: Matrix.nullish(),
    matrixKind: MatrixKind.nullish(),
    sampledBy: z.guid().nullish(),
    sampledAt: z.string().nullish(),
    reference: z.string().nullish(),
    compliance: SampleCompliance.nullish(),
    withAtLeastOneResidue: coerceToBooleanNullish(),
    laboratoryId: z.guid().nullish()
  })
  .merge(Pagination.partial());

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
    region: isNationalRole(userRole) ? query.region : user.region,
    departments: departmentIsRequired(user)
      ? [user.department as Department]
      : query.departments,
    companySirets,
    kinds: programmingPlanKindsIsRequired(user)
      ? user.programmingPlanKinds
      : query.kinds
  } as FindSampleOptions;
};
