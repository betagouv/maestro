import { fakerFR } from '@faker-js/faker';
import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { Substance } from '../schema/Substance/Substance';

export const genNumber = (length = 10) => {
  return Number(
    randomstring.generate({
      length,
      charset: 'numeric',
    })
  );
};

export const genBoolean = () => Math.random() < 0.5;

export const genSiret = () =>
  randomstring.generate({
    length: 14,
    charset: '123456789',
  });

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const genLaboratory = (): Laboratory => ({
  id: uuidv4(),
  name: randomstring.generate(),
  email: fakerFR.internet.email(),
});

export const genSubstance = (): Substance => ({
  code: randomstring.generate(),
  label: randomstring.generate(),
});
