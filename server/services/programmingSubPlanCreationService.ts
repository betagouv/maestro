import { max } from 'lodash-es';
import {
  managedKey,
  ProgrammingPlanSettingKey,
  ProgrammingPlanSettings
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import {
  isPPVSubPlanNumber,
  type ProgrammingSubPlanId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { executeTransaction } from '../repositories/kysely';
import prescriptionRepository from '../repositories/prescriptionRepository';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { nextSubPlanNumber } from './programmingPlanDuplicationService';

export const newSubPlanSettings = (
  planSettings: ProgrammingPlanSettings
): ProgrammingPlanSettings =>
  ProgrammingPlanSettings.parse(
    Object.fromEntries(
      ProgrammingPlanSettingKey.options.flatMap((settingKey) => [
        [settingKey, null],
        [managedKey(settingKey), !planSettings[managedKey(settingKey)]]
      ])
    )
  );

export const newSubPlanNumber = (subPlanNumbers: string[]): string => {
  const ppvSubPlanNumbers = subPlanNumbers.filter(isPPVSubPlanNumber);

  return nextSubPlanNumber(
    max(ppvSubPlanNumbers.length > 0 ? ppvSubPlanNumbers : subPlanNumbers) ??
      '',
    subPlanNumbers
  );
};

const createSubPlan = async (
  programmingPlan: ProgrammingPlanChecked
): Promise<ProgrammingSubPlanId> =>
  executeTransaction(async (trx) => {
    const subPlanNumber = newSubPlanNumber(
      programmingPlan.subPlans.map(({ subPlanNumber }) => subPlanNumber)
    );

    const id = await programmingSubPlanRepository.insert(
      {
        ...newSubPlanSettings(programmingPlan),
        programmingPlanId: programmingPlan.id,
        subPlanNumber
      },
      trx
    );

    await prescriptionRepository.insertEmpty({ id, subPlanNumber }, trx);

    return id;
  });

export const programmingSubPlanCreationService = {
  createSubPlan
};
