import { z } from 'zod';
import { Context, ContextLabels } from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum([
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
    ProgrammingPlanValidated: 'Lancement de la campagne de prélèvements'
  };

export const NotificationCategoryMessages: Partial<
  Record<NotificationCategory, string>
> = {
  ProgrammingPlanSubmitted: `
Maestro vient d’être mis à jour !  

Une proposition de programmation pour la prochaine campagne de surveillance / contrôle officielle a été déposée sur Maestro par la coordination nationale.   

Merci de prendre connaissance de ces nouveaux éléments et y réagir le cas échéant.`,
  ProgrammingPlanValidated: `
L’étape de programmation a été clôturée par la coordination nationale.  

En tant que coordinateur régional, vous pouvez dorénavant vous connecter à Maestro sur l’espace "programmation" afin d’attribuer le/les laboratoires responsables des analyses officielles en lien avec les matrices programmées pour la prochaine campagne du dispositif PSPC dans votre région.  

Une fois le/les laboratoires attribués, la campagne sera officiellement lancée et les inspecteurs/préleveurs de vos régions pourront initier leurs prélèvements.`
};
