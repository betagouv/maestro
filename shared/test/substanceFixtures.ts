import { fakerFR } from '@faker-js/faker';
import { SSD2Ids } from '../referential/Residue/SSD2Id';
import { Substance } from '../schema/Substance/Substance';
import { oneOf } from './testFixtures';

export const genSubstance = (data?: Partial<Substance>): Substance => ({
  code: oneOf(SSD2Ids),
  label: fakerFR.string.alphanumeric(32),
  ...data
});
