import randomstring from 'randomstring';

export const genEmail = () => {
  return (
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    }) +
    '@' +
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    }) +
    '.' +
    randomstring.generate({
      length: 2,
      charset: 'alphabetic',
    })
  );
};

export const genNumber = (length = 10) => {
  return Number(
    randomstring.generate({
      length,
      charset: 'numeric',
    }),
  );
};

export const genBoolean = () => Math.random() < 0.5;

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}
