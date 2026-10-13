import type { LegalContext } from 'maestro-shared/referential/LegalContext';
import type { ProgrammingPlanContext } from 'maestro-shared/schema/ProgrammingPlan/Context';

export const sampleLegalContext = ({
  isPPV,
  context,
  legalContext
}: {
  isPPV: boolean;
  context?: ProgrammingPlanContext | 'OutsideProgrammingPlan';
  legalContext?: LegalContext | null;
}): LegalContext | null | undefined => {
  if (isPPV) {
    return legalContext;
  }
  return context === 'OutsideProgrammingPlan' ? null : 'A';
};
