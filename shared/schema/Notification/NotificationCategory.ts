import { z } from 'zod';
import {
  ContextLabels,
  ProgrammingPlanContextList
} from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum([
  'ProgrammingPlanSubmittedToRegion',
  'ProgrammingPlanApprovedByRegion',
  'ProgrammingPlanSubmittedToDepartments',
  'ProgrammingPlanValidated',
  'AnalysisReviewTodo',
  ...ProgrammingPlanContextList
]);

export const NotificationCategoryList = NotificationCategory.options;

export type NotificationCategory = z.infer<typeof NotificationCategory>;

export const NotificationCategoryTitles: Record<NotificationCategory, string> =
  {
    ...ContextLabels,
    ProgrammingPlanSubmittedToRegion:
      'Nouveau plan de programmation disponible',
    ProgrammingPlanApprovedByRegion: 'Plan de programmation approuvé',
    ProgrammingPlanSubmittedToDepartments:
      'Nouveau plan de programmation disponible',
    ProgrammingPlanValidated: 'Lancement de la campagne de prélèvements',
    AnalysisReviewTodo: 'Analyse reçue, interprétation à faire'
  };
