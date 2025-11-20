import { expect } from 'vitest';

export const expectArrayToContainElements = <T extends { id: string }>(
  actual: T[],
  expected: (T | ReturnType<typeof expect.objectContaining>)[]
) => {
  const sortById = (arr: any[]) =>
    [...arr].sort((a, b) => {
      const idA = a.id || a.asymmetricMatch?.toString() || '';
      const idB = b.id || b.asymmetricMatch?.toString() || '';
      return idA.localeCompare(idB);
    });

  expect(sortById(actual)).toEqual(expect.arrayContaining(sortById(expected)));
};
