import { seed as seedCompanies } from './001-companies';
import { seed as seedLaboratories } from './002-laboratories';
import { seed as seedUsers } from './003-users';
import { seed as seedProgrammingPlans } from './004-programming-plans';
import { seed as seedPrescriptions } from './005-prescriptions';
import { seed as seedSamples } from './006-samples';
import { seed as seedLaboratoryAgreements } from './007-laboratory-agreements';

export const dbSeed = async (): Promise<void> => {
  await seedCompanies();
  await seedLaboratories();
  await seedUsers();
  await seedProgrammingPlans();
  await seedPrescriptions();
  await seedSamples();
  await seedLaboratoryAgreements();
};
