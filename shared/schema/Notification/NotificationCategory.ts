import { z } from 'zod/v4';
import {
  ContextLabels,
  ProgrammingPlanContextList
} from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum([
  'ProgrammingPlanSubmitted',
  'ProgrammingPlanApproved',
  'ProgrammingPlanValidated',
  'AnalysisReviewTodo',
  ...ProgrammingPlanContextList
]);

export const NotificationCategoryList = NotificationCategory.options;

export type NotificationCategory = z.infer<typeof NotificationCategory>;

export const NotificationCategoryTitles: Record<NotificationCategory, string> =
  {
    ...ContextLabels,
    ProgrammingPlanSubmitted: 'Nouveau plan de programmation disponible',
    ProgrammingPlanApproved: 'Plan de programmation approuvé',
    ProgrammingPlanValidated: 'Lancement de la campagne de prélèvements',
    AnalysisReviewTodo: 'Analyse reçue, interprétation à faire'
  };
