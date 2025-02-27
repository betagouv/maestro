import randomstring from 'randomstring';
import { Substance } from '../schema/Substance/Substance';

export const genSubstance = (data?: Partial<Substance>): Substance => ({
  code: randomstring.generate(),
  label: randomstring.generate(),
  ...data
});
