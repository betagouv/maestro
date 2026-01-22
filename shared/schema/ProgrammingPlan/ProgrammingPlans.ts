import { isNil } from 'lodash-es';
import { z } from 'zod';
import { LegalContext } from '../../referential/LegalContext';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { UserRefined } from '../User/User';
import { isNationalRole, isRegionalRole, UserRole } from '../User/UserRole';
import { ProgrammingPlanContext } from './Context';
import { DistributionKind } from './DistributionKind';
import { ProgrammingPlanDomain } from './ProgrammingPlanDomain';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import {
  ProgrammingPlanDepartmentalStatus,
  ProgrammingPlanRegionalStatus
} from './ProgrammingPlanLocalStatus';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlanBase = z.object({
  id: z.guid(),
  domain: ProgrammingPlanDomain,
  title: z.string().min(1, 'Veuillez renseigner le titre.'),
  kinds: z
    .array(ProgrammingPlanKind)
    .min(1, 'Veuillez renseigner au moins un type de plan.'),
  contexts: z
    .array(ProgrammingPlanContext)
    .min(1, 'Veuillez renseigner au moins un contexte.'),
  legalContexts: z
    .array(LegalContext)
    .min(1, 'Veuillez renseigner au moins un cadre juridique.'),
  samplesOutsidePlanAllowed: z.boolean(),
  substanceKinds: z.array(SubstanceKind),
  distributionKind: DistributionKind,
  createdAt: z.coerce.date(),
  createdBy: z.guid(),
  year: z.number(),
  regionalStatus: z.array(ProgrammingPlanRegionalStatus),
  departmentalStatus: z.array(ProgrammingPlanDepartmentalStatus),
  closedAt: z.coerce.date().nullish(),
  closedBy: z.guid().nullish()
});

export const ProgrammingPlanChecked = ProgrammingPlanBase.check((ctx) => {
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
    ctx.value.regionalStatus.some((status) => status.status !== 'Closed')
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: 'custom',
      message: 'Status régional doit être "Closed" si closedAt est renseigné',
      path: ['regionalStatus']
    });
  }
});

export type ProgrammingPlanChecked = z.infer<typeof ProgrammingPlanChecked>;

export const isClosed = (plan: ProgrammingPlanChecked): boolean => {
  return !isNil(plan.closedAt);
};

export const ProgrammingPlanSort = (
  a: ProgrammingPlanChecked,
  b: ProgrammingPlanChecked
) => b.year - a.year;

export const hasProgrammingPlanStatusForAuthUser = (
  programmingPlan: ProgrammingPlanChecked,
  status: ProgrammingPlanStatus[],
  user?: UserRefined,
  userRole?: UserRole
) =>
  userRole &&
  user &&
  (isNationalRole(userRole)
    ? programmingPlan.regionalStatus.every((regionalStatus) =>
        status.includes(regionalStatus.status)
      )
    : isRegionalRole(userRole) ||
        programmingPlan.distributionKind === 'REGIONAL'
      ? programmingPlan.regionalStatus.some(
          (regionalStatus) =>
            regionalStatus.region === user.region &&
            status.includes(regionalStatus.status)
        )
      : programmingPlan.departmentalStatus.some(
          (departmentalStatus) =>
            departmentalStatus.department === user.department &&
            status.includes(departmentalStatus.status)
        ));
