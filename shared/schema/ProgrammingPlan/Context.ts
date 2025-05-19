import { z } from 'zod';

export const Context = z.enum(
  ['Control', 'Surveillance', 'LocalPlan', 'Investigation', 'ControlSupport'],
  {
    errorMap: () => ({ message: 'Veuillez renseigner le contexte.' })
  }
);

export type Context = z.infer<typeof Context>;

export const ContextList: Context[] = Context.options;

export const ProgrammingPlanContextList: Context[] = [
  'Control',
  'Surveillance'
];

export const ContextLabels: Record<Context, string> = {
  Surveillance: 'Plan de surveillance',
  Control: 'Plan de contrôle',
  LocalPlan: 'Plan local',
  Investigation: 'Enquête',
  ControlSupport: 'Appui au contrôle'
};
