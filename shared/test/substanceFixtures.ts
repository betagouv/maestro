import { Substance } from '../schema/Substance/Substance';
import { fakerFR } from '@faker-js/faker';
import { oneOf } from './testFixtures';
import { SSD2Ids } from '../referential/Residue/SSD2Id';

export const genSubstance = (data?: Partial<Substance>): Substance => ({
  code: oneOf(SSD2Ids),
  label: fakerFR.string.alphanumeric(32),
  ...data
});
