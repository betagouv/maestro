import { fakerFR } from '@faker-js/faker';
import { SSD2Referential } from '../referential/Residue/SSD2Referential';
import { Substance } from '../schema/Substance/Substance';
import { oneOf } from './testFixtures';

export const genSubstance = (data?: Partial<Substance>): Substance => ({
  code: oneOf(Object.keys(SSD2Referential)),
  label: fakerFR.string.alphanumeric(32),
  ...data
});
