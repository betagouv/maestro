import { z } from 'zod';
import { Context, ContextLabels } from '../ProgrammingPlan/Context';
import { Brand } from '../../constants';

export const NotificationCategory = z.enum([
  'ProgrammingPlanSubmitted',
  'ProgrammingPlanValidated',
  'AnalysisReviewTodo',
  ...Context.options
]);

export const NotificationCategoryList = NotificationCategory.options;

export type NotificationCategory = z.infer<typeof NotificationCategory>;

export const NotificationCategoryTitles: Record<NotificationCategory, string> =
  {
    ...ContextLabels,
    ProgrammingPlanSubmitted: 'Nouveau plan de programmation disponible',
    ProgrammingPlanValidated: 'Lancement de la campagne de prélèvements',
    AnalysisReviewTodo: 'Analyse reçue, interprétation à faire',
  };

export const NotificationCategoryMessages = {
  ProgrammingPlanSubmitted: `
${Brand} vient d’être mis à jour !  

Une proposition de programmation pour la prochaine campagne de surveillance / contrôle officielle a été déposée sur ${Brand}  par la coordination nationale.   

Merci de prendre connaissance de ces nouveaux éléments et y réagir le cas échéant.`,
  ProgrammingPlanValidated: `
L’étape de programmation a été clôturée par la coordination nationale.  

En tant que coordinateur régional, vous pouvez dorénavant vous connecter à ${Brand} sur l’espace "programmation" afin d’attribuer le/les laboratoires responsables des analyses officielles en lien avec les matrices programmées pour la prochaine campagne du dispositif PSPC dans votre région.  

Une fois le/les laboratoires attribués, la campagne sera officiellement lancée et les inspecteurs/préleveurs de vos régions pourront initier leurs prélèvements.`,
  AnalysisReviewTodo: `Un rapport d'analyse de l'un de vos prélèvements vient d'être reçu par ${Brand}. Veuillez-vous connecter, faire la vérification des données issues de celui-ci et réaliser l'interprétation globale pour finaliser vos actions sur ce prélèvement.`
} as const satisfies Partial<Record<NotificationCategory, string>>
