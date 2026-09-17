import { z } from 'zod';
import {
  ContextLabels,
  ProgrammingPlanContextList
} from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum([
  'ProgrammingPlanSubmittedToRegion',
  'ProgrammingPlanSubmittedToDepartments',
  'ProgrammingPlanValidated',
  'ProgrammingPlanCampaignLaunched',
  'ProgrammingPlanModifiedAfterSubmission',
  'ProgrammingPlanReadyForAdminReview',
  'LaboratoryAgreementsToManage',
  'LaboratoryAgreementLost',
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
    ProgrammingPlanCampaignLaunched: 'Lancement de la campagne',
    ProgrammingPlanModifiedAfterSubmission:
      'Programmation modifiée après diffusion',
    ProgrammingPlanReadyForAdminReview: 'Programmation prête pour diffusion',
    LaboratoryAgreementsToManage: 'Agréments des laboratoires à gérer',
    LaboratoryAgreementLost: 'Perte d’agrément d’un laboratoire',
    AnalysisReviewTodo: 'Analyse reçue, interprétation à faire',
    ResourceDocumentUploaded: 'Nouveau document'
  };
