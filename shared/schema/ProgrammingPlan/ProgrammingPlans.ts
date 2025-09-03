import { isNil } from 'lodash-es';
import { z } from 'zod';
import { ProgrammingPlanContext } from './Context';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanRegionalStatus } from './ProgrammingPlanRegionalStatus';

export const ProgrammingPlan = z
  .object({
    id: z.guid(),
    kinds: z.array(ProgrammingPlanKind),
    contexts: z.array(ProgrammingPlanContext),
    samplesOutsidePlanAllowed: z.boolean(),
    createdAt: z.coerce.date(),
    createdBy: z.guid(),
    year: z.number(),
    regionalStatus: z.array(ProgrammingPlanRegionalStatus),
    closedAt: z.coerce.date().nullish(),
    closedBy: z.guid().nullish()
  })
  .check((ctx) => {
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

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;

export const isClosed = (plan: ProgrammingPlan): boolean => {
  return !isNil(plan.closedAt);
};
