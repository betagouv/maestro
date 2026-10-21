import { z } from 'zod';
import { FindSampleOptions } from './FindSampleOptions';
import { SampleStatus } from './SampleStatus';

export const DashboardTerritoryLevel = z.enum([
  'Region',
  'Department',
  'Company'
]);

export type DashboardTerritoryLevel = z.infer<typeof DashboardTerritoryLevel>;

export const FindDashboardStatsOptions = FindSampleOptions.extend({
  territoryLevel: DashboardTerritoryLevel.nullish()
});

export type FindDashboardStatsOptions = z.infer<
  typeof FindDashboardStatsOptions
>;

export const SampleStatusCounts = z.object(
  Object.fromEntries(
    SampleStatus.options.map((status) => [status, z.coerce.number().default(0)])
  ) as Record<SampleStatus, z.ZodDefault<z.ZodCoercedNumber<unknown>>>
);

export type SampleStatusCounts = z.infer<typeof SampleStatusCounts>;

export const DashboardTerritoryStat = z.object({
  key: z.string(),
  programmedCount: z.coerce.number().default(0),
  countsByStatus: SampleStatusCounts
});

export type DashboardTerritoryStat = z.infer<typeof DashboardTerritoryStat>;

export const DashboardStats = z.object({
  programmedCount: z.coerce.number().default(0),
  planCount: z.coerce.number().default(0),
  subPlanCount: z.coerce.number().default(0),
  countsByStatus: SampleStatusCounts,
  compliantCount: z.coerce.number().default(0),
  nonCompliantCount: z.coerce.number().default(0),
  receivedItemCount: z.coerce.number().default(0),
  notAdmissibleItemCount: z.coerce.number().default(0),
  byTerritory: z.array(DashboardTerritoryStat),
  sentByMonth: z.array(
    z.object({
      month: z.coerce.number().int(),
      count: z.coerce.number().default(0)
    })
  ),
  averageSampledToDaiHours: z.coerce.number().nullable()
});

export type DashboardStats = z.infer<typeof DashboardStats>;

const realizedStatuses = [
  'Sent',
  'Analysis',
  'InReview',
  'Completed'
] as const satisfies SampleStatus[];

const analyzedStatuses = [
  'InReview',
  'Completed'
] as const satisfies SampleStatus[];

export const realizedCount = (counts: SampleStatusCounts): number =>
  realizedStatuses.reduce((total, status) => total + counts[status], 0);

export const analyzedCount = (counts: SampleStatusCounts): number =>
  analyzedStatuses.reduce((total, status) => total + counts[status], 0);

export const notAdmissibleRate = (
  stats: Pick<DashboardStats, 'receivedItemCount' | 'notAdmissibleItemCount'>
): number =>
  stats.receivedItemCount === 0
    ? 0
    : Math.round(
        (stats.notAdmissibleItemCount / stats.receivedItemCount) * 100
      );

export const objectiveRate = (
  count: number,
  programmedCount: number
): number =>
  programmedCount === 0 ? 0 : Math.round((count / programmedCount) * 100);
