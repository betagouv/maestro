import {
  SlaughterhouseWorkshopFixture1,
  SlaughterhouseWorkshopFixture2
} from 'maestro-shared/test/companyFixtures';
import { CompanyWorkshops } from '../../repositories/companyWorkshopRepository';

export const seed = async (): Promise<void> => {
  await CompanyWorkshops().insert([
    SlaughterhouseWorkshopFixture1,
    SlaughterhouseWorkshopFixture2
  ]);
};
