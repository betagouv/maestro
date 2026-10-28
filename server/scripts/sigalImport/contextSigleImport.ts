import { keyBy } from 'lodash-es';
import { type MaestroSubPlan, SubPlanCodeAliases } from './descriptorImport';
import type { SigalSubPlanRow } from './sigalWorkbook';

export type ContextSigleUpdate = {
  subPlanNumber: string;
  sachaContextSigle: string;
};

export type ContextSigleImport = {
  updates: ContextSigleUpdate[];
  conflicts: (ContextSigleUpdate & { currentSachaContextSigle: string })[];
};

export const computeContextSigleImport = (
  sigalSubPlans: SigalSubPlanRow[],
  maestroSubPlans: MaestroSubPlan[]
): ContextSigleImport => {
  const maestroSubPlansByNumber = keyBy(maestroSubPlans, 'subPlanNumber');
  const updates: ContextSigleImport['updates'] = [];
  const conflicts: ContextSigleImport['conflicts'] = [];

  for (const { acte, code } of sigalSubPlans) {
    const subPlanNumber = SubPlanCodeAliases[code] ?? code;
    const maestroSubPlan = maestroSubPlansByNumber[subPlanNumber];
    if (
      !maestroSubPlan ||
      maestroSubPlan.sachaContextSigle === acte ||
      [...updates, ...conflicts].some(
        (update) => update.subPlanNumber === subPlanNumber
      )
    ) {
      continue;
    }
    if (maestroSubPlan.sachaContextSigle === null) {
      updates.push({ subPlanNumber, sachaContextSigle: acte });
    } else {
      conflicts.push({
        subPlanNumber,
        sachaContextSigle: acte,
        currentSachaContextSigle: maestroSubPlan.sachaContextSigle
      });
    }
  }

  return { updates, conflicts };
};
