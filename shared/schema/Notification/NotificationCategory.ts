import { z } from 'zod';
import {
  ContextLabels,
  ProgrammingPlanContextList
} from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum([
  'ProgrammingPlanSubmittedToRegion',
  'ProgrammingPlanSubmittedToDepartments',
  'ProgrammingPlanValidated',
  'ProgrammingPlanModifiedAfterSubmission',
  'ProgrammingPlanReadyForAdminReview',
  'AnalysisReviewTodo',
  'ResourceDocumentUploaded',
  ...ProgrammingPlanContextList
]);

export const NotificationCategoryList = NotificationCategory.options;

export type NotificationCategory = z.infer<typeof NotificationCategory>;

export const NotificationCategoryTitles: Record<NotificationCategory, string> =
  {
    ...ContextLabels,
    ProgrammingPlanSubmittedToRegion:
      'Nouveau plan de programmation disponible',
    ProgrammingPlanSubmittedToDepartments:
      'Nouveau plan de programmation disponible',
    ProgrammingPlanValidated: 'Lancement de la campagne de prélèvements',
    ProgrammingPlanModifiedAfterSubmission:
      'Programmation modifiée après diffusion',
    ProgrammingPlanReadyForAdminReview: 'Programmation prête pour diffusion',
    AnalysisReviewTodo: 'Analyse reçue, interprétation à faire',
    ResourceDocumentUploaded: 'Nouveau document'
  };
