import { fakerFR } from '@faker-js/faker';

export const genSiret = () => fakerFR.string.numeric(14)

export function oneOf<T>(array: Array<T>): T {
  return fakerFR.helpers.arrayElement(array)
}
