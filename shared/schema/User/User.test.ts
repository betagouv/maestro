import { describe, expect, test } from 'vitest';
import { genUser } from '../../test/userFixtures';
import { canSignIn, certificationIsRequired } from './User';

describe('certificationIsRequired', () => {
  test('should be required for a sampler only account', () => {
    expect(certificationIsRequired({ roles: ['Sampler'] })).toBe(true);
  });

  test('should not be required when the account holds another role', () => {
    expect(
      certificationIsRequired({ roles: ['Sampler', 'DepartmentalCoordinator'] })
    ).toBe(false);
    expect(certificationIsRequired({ roles: ['AdministratorMaestro'] })).toBe(
      false
    );
  });
});

describe('canSignIn', () => {
  test('should refuse an uncertified sampler', () => {
    expect(canSignIn(genUser({ roles: ['Sampler'], certified: false }))).toBe(
      false
    );
  });

  test('should allow a certified sampler', () => {
    expect(canSignIn(genUser({ roles: ['Sampler'], certified: true }))).toBe(
      true
    );
  });

  test('should refuse any uncertified account, whatever its roles', () => {
    expect(
      canSignIn(
        genUser({
          roles: ['Sampler', 'DepartmentalCoordinator'],
          certified: false
        })
      )
    ).toBe(false);
  });

  test('should refuse a disabled account whatever its certification', () => {
    expect(
      canSignIn(
        genUser({
          roles: ['DepartmentalCoordinator'],
          certified: true,
          disabled: true
        })
      )
    ).toBe(false);
  });
});
