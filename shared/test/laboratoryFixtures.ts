import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Laboratory } from '../schema/Laboratory/Laboratory';

export const genLaboratory = (data?: Partial<Laboratory>): Laboratory => ({
  id: uuidv4(),
  shortName: 'GIR 49',
  name: fakerFR.company.name(),
  address: fakerFR.location.streetAddress(),
  postalCode: fakerFR.location.zipCode('#####'),
  city: fakerFR.location.city(),
  emails: [fakerFR.internet.email()],
  ...data
});
export const LaboratoryFixture = genLaboratory({
  id: '11111111-1111-1111-1111-111111111111'
});
