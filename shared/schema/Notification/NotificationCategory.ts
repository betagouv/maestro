import { z } from 'zod';
import { Context, ContextLabels } from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum([
  'Sample',
  'ProgrammingPlanSubmitted',
  'ProgrammingPlanValidated',
  ...Context.options
]);

export const NotificationCategoryList = NotificationCategory.options;

export type NotificationCategory = z.infer<typeof NotificationCategory>;

export const NotificationCategoryTitles: Record<NotificationCategory, string> =
  {
    ...ContextLabels,
    ProgrammingPlanSubmitted: 'Nouveau plan de programmation disponible',
    ProgrammingPlanValidated: 'Lancement de la campagne de prélèvements',
    Sample: 'Prélèvements'
  };
