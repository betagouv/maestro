import { isNil } from 'lodash-es';
import { z } from 'zod';
import { LegalContext } from '../../referential/LegalContext';
import { checkSchema } from '../../utils/zod';
import { ProgrammingPlanContext } from './Context';
import { DistributionKind } from './DistributionKind';
import { ProgrammingPlanDomain } from './ProgrammingPlanDomain';
import { ProgrammingSubPlanId } from './ProgrammingSubPlan';

export const ProgrammingPlanBase = z.object({
  id: z.guid(),
  domain: ProgrammingPlanDomain,
  title: z.string().min(1, 'Veuillez renseigner le titre.'),
  subPlanIds: z
    .array(ProgrammingSubPlanId)
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
