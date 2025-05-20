import { z } from 'zod';

export const Context = z.enum(
  ['Control', 'Surveillance', 'LocalPlan', 'Investigation', 'ControlSupport'],
  {
    errorMap: () => ({ message: 'Veuillez renseigner le contexte.' })
  }
);

export const ProgrammingPlanContext = Context.extract([
  'Control',
  'Surveillance'
]);

export const OutsideProgrammingPlanContext = Context.extract([
  'LocalPlan',
  'Investigation',
  'ControlSupport'
]);

export type Context = z.infer<typeof Context>;
export type ProgrammingPlanContext = z.infer<typeof ProgrammingPlanContext>;
export type OutsideProgrammingPlanContext = z.infer<
  typeof OutsideProgrammingPlanContext
>;

export const ContextList: Context[] = Context.options;
export const ProgrammingPlanContextList = ProgrammingPlanContext.options;

export const ContextLabels: Record<Context, string> = {
  Surveillance: 'Plan de surveillance',
  Control: 'Plan de contrôle',
  LocalPlan: 'Plan local',
  Investigation: 'Enquête',
  ControlSupport: 'Appui au contrôle'
};
