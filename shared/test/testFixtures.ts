import randomstring from 'randomstring';
import { Substance } from '../schema/Substance/Substance';

export const genNumber = (length = 10) => {
  return Number(
    randomstring.generate({
      length,
      charset: 'numeric'
    })
  );
};

export const genBoolean = () => Math.random() < 0.5;

export const genSiret = () =>
  randomstring.generate({
    length: 14,
    charset: '123456789'
  });

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export const genSubstance = (): Substance => ({
  code: randomstring.generate(),
  label: randomstring.generate()
});
