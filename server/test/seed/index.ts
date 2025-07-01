import { seed as seedUsers } from './001-users';
import { seed as seedProgrammingPlans } from './002-programming-plans';
import { seed as seedCompanie } from './003-companies';
import { seed as seedLaboratorie } from './004-laboratories';
import { seed as seedPrescriptions } from './005-prescriptions';
import { seed as seedSamples } from './006-samples';

export const dbSeed = async (): Promise<void> => {
  await seedUsers();
  await seedProgrammingPlans();
  await seedCompanie();
  await seedLaboratorie();
  await seedPrescriptions();
  await seedSamples();
};
