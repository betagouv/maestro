import { seed as seedUsers } from './001-users';
import { seed as seedProgrammingPlans } from './002-programming-plans';
import { seed as seedCompanie } from './003-companies';
import { seed as seedSamples } from './004-samples';
import { seed as seedLaboratorie } from './005-laboratories';

export const dbSeed = async (): Promise<void> => {
  await seedUsers();
  await seedProgrammingPlans();
  await seedCompanie();
  await seedSamples();
  await seedLaboratorie();
};
