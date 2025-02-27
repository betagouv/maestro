import randomstring from 'randomstring';

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
