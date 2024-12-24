import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import { Laboratory } from '../schema/Laboratory/Laboratory';

export const genLaboratory = (data?: Partial<Laboratory>): Laboratory => ({
  id: uuidv4(),
  name: 'GIR 49',
  email: fakerFR.internet.email(),
  ...data,
});
