import { Substance } from '../schema/Substance/Substance';
import { fakerFR } from '@faker-js/faker';

export const genSubstance = (data?: Partial<Substance>): Substance => ({
  code: fakerFR.string.alphanumeric(32),
  label: fakerFR.string.alphanumeric(32),
  ...data
});
