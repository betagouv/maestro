import { z } from 'zod';
import { Context, ContextLabels } from '../ProgrammingPlan/Context';

export const NotificationCategory = z.enum(['Sample', ...Context.options]);

export const NotificationCategoryList = NotificationCategory.options;

export type NotificationCategory = z.infer<typeof NotificationCategory>;

export const NotificationCategoryLabels: Record<NotificationCategory, string> =
  {
    ...ContextLabels,
    Sample: 'Prélèvements'
  };
