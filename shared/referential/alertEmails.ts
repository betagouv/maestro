import type { DistributionKind } from '../schema/ProgrammingPlan/DistributionKind';
import { type Department, DepartmentAlertEmails } from './Department';
import { type Region, Regions } from './Region';

export const getAlertEmails = ({
  distributionKind,
  region,
  department
}: {
  distributionKind: DistributionKind;
  region: Region;
  department?: Department | null;
}): string[] => {
  switch (distributionKind) {
    case 'REGIONAL':
      return Regions[region].alertEmails;
    case 'SLAUGHTERHOUSE':
      return department ? (DepartmentAlertEmails[department] ?? []) : [];
    case 'TO_BE_DEFINED':
      return [];
  }
};
