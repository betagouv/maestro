import { isNil } from 'lodash-es';
import { z } from 'zod';
import { LegalContext } from '../../referential/LegalContext';
import { checkSchema } from '../../utils/zod';
import type { UserRefined } from '../User/User';
import {
  isNationalRole,
  isRegionalRole,
  type UserRole
} from '../User/UserRole';
import { ProgrammingPlanContext } from './Context';
import { DistributionKind } from './DistributionKind';
import { ProgrammingPlanDomain } from './ProgrammingPlanDomain';
import type { ProgrammingPlanStatus } from './ProgrammingPlanStatus';
import { ProgrammingSubPlan } from './ProgrammingSubPlan';

export const ProgrammingPlanBase = z.object({
  id: z.guid(),
  domain: ProgrammingPlanDomain,
  title: z.string().min(1, 'Veuillez renseigner le titre.'),
  subPlans: z
    .array(ProgrammingSubPlan)
    .min(1, 'Veuillez renseigner au moins un sous-plan.'),
  contexts: z
    .array(ProgrammingPlanContext)
    .min(1, 'Veuillez renseigner au moins un contexte.'),
  legalContexts: z
    .array(LegalContext)
    .min(1, 'Veuillez renseigner au moins un cadre juridique.'),
  samplesOutsidePlanAllowed: z.boolean(),
  distributionKind: DistributionKind,
  createdAt: z.coerce.date(),
  createdBy: z.guid(),
  year: z.number(),
  closedAt: z.coerce.date().nullish(),
  closedBy: z.guid().nullish()
});

export const isProgrammingPlanFullyClosed = (
  subPlans: Pick<ProgrammingSubPlan, 'regionalStatus'>[]
): boolean =>
  subPlans.length > 0 &&
  subPlans.every(
    (subPlan) =>
      subPlan.regionalStatus.length > 0 &&
      subPlan.regionalStatus.every((status) => status.status === 'Closed')
  );

export const ProgrammingPlanChecked = checkSchema(
  ProgrammingPlanBase,
  (ctx) => {
    if (ctx.value.closedAt && !ctx.value.closedBy) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: 'Veuillez renseigner closedBy si closedAt est renseigné',
        path: ['closedBy']
      });
    }
    if (
      ctx.value.closedAt &&
      !isProgrammingPlanFullyClosed(ctx.value.subPlans)
    ) {
      ctx.issues.push({
        input: ctx.value,
        code: 'custom',
        message: 'Status régional doit être "Closed" si closedAt est renseigné',
        path: ['subPlans']
      });
    }
  }
);

export type ProgrammingPlanChecked = z.infer<typeof ProgrammingPlanChecked>;

export const isClosed = (plan: ProgrammingPlanChecked): boolean => {
  return !isNil(plan.closedAt);
};

export const ProgrammingPlanSort = (
  a: ProgrammingPlanChecked,
  b: ProgrammingPlanChecked
) => b.year - a.year || a.title.localeCompare(b.title);

export const hasProgrammingPlanStatusForAuthUser = (
  programmingPlan: ProgrammingPlanChecked,
  status: ProgrammingPlanStatus[],
  user?: Pick<UserRefined, 'region' | 'department'>,
  userRole?: UserRole
) =>
  userRole &&
  user &&
  (isNationalRole(userRole)
    ? programmingPlan.subPlans.every((subPlan) =>
        subPlan.regionalStatus.every((regionalStatus) =>
          status.includes(regionalStatus.status)
        )
      )
    : isRegionalRole(userRole) ||
        programmingPlan.distributionKind === 'REGIONAL'
      ? programmingPlan.subPlans.some((subPlan) =>
          subPlan.regionalStatus.some(
            (regionalStatus) =>
              regionalStatus.region === user.region &&
              status.includes(regionalStatus.status)
          )
        )
      : programmingPlan.subPlans.some((subPlan) =>
          subPlan.departmentalStatus.some(
            (departmentalStatus) =>
              departmentalStatus.department === user.department &&
              status.includes(departmentalStatus.status)
          )
        ));
