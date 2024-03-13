import { AuthUser } from '../src/models/User';

const randomstring = require('randomstring');

export const genBoolean = () => Math.random() < 0.5;

export const genSiret = () => genNumber(14);

export function oneOf<T>(array: Array<T>): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function genEmail() {
  return (
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    }) +
    '@' +
    randomstring.generate({
      length: 10,
      charset: 'alphabetic',
    })
  );
}

export function genNumber(length = 10) {
  return randomstring.generate({
    length,
    charset: 'numeric',
  });
}

export function genAuthUser(): AuthUser {
  return {
    accessToken: randomstring.generate(),
    userId: genNumber(10),
  };
}

export const genCoords = () => ({
  coords: {
    latitude: Math.random() * 180 - 90,
    longitude: Math.random() * 360 - 180,
  },
});
