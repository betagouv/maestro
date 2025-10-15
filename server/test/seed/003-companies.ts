import {
  CompanyFixture,
  SlaughterhouseCompanyFixture1
} from 'maestro-shared/test/companyFixtures';
import { Companies } from '../../repositories/companyRepository';

export const seed = async (): Promise<void> => {
  await Companies().insert([CompanyFixture, SlaughterhouseCompanyFixture1]);
};
