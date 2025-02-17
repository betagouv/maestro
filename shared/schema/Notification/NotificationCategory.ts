import { z } from 'zod';

export const NotificationCategory = z.enum([
  'NewRegionalPrescriptionComment',
  'ControlProgrammingPlan',
  'SurveillanceProgrammingPlan'
]);

export type NotificationCategory = z.infer<typeof NotificationCategory>;
