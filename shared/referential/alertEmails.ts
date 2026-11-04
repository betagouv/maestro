import type { DistributionKind } from '../schema/ProgrammingPlan/DistributionKind';
import { isPPVSubPlanNumber } from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { type Department, DepartmentAlertEmails } from './Department';
import { type Region, Regions } from './Region';

export const getAlertEmails = ({
  distributionKind,
  region,
  department,
  programmingSubPlanNumber
}: {
  distributionKind: DistributionKind;
  region: Region;
  department?: Department | null;
  programmingSubPlanNumber?: string | null;
}): string[] => {
  if (isPPVSubPlanNumber(programmingSubPlanNumber)) {
    return [];
  }
  switch (distributionKind) {
    case 'REGIONAL':
      return Regions[region].alertEmails;
    case 'SLAUGHTERHOUSE':
      return department ? (DepartmentAlertEmails[department] ?? []) : [];
    case 'DEPARTMENTAL':
      return [];
  }
};
