import { describe, expect, test } from 'vitest';
import { genUser } from '../../test/userFixtures';
import {
  canSignIn,
  certificationIsRequired,
  programmingSubPlansAreRestricted,
  stagesIsRequired
} from './User';

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

describe('stagesIsRequired', () => {
  test('should be required for a sampler', () => {
    expect(stagesIsRequired({ roles: ['Sampler'] })).toBe(true);
  });

  test('should not be required for a national coordinator', () => {
    expect(stagesIsRequired({ roles: ['NationalCoordinator'] })).toBe(false);
    expect(
      stagesIsRequired({ roles: ['NationalCoordinator', 'Sampler'] })
    ).toBe(false);
  });

  test('should not be required for administrators and laboratories', () => {
    expect(stagesIsRequired({ roles: ['AdministratorMaestro'] })).toBe(false);
    expect(stagesIsRequired({ roles: ['AdministratorBGIR'] })).toBe(false);
    expect(stagesIsRequired({ roles: ['LaboratoryUser'] })).toBe(false);
    expect(stagesIsRequired({ roles: ['LaboratoryOffice'] })).toBe(false);
  });
});

describe('programmingSubPlansAreRestricted', () => {
  test('should restrict a national coordinator', () => {
    expect(
      programmingSubPlansAreRestricted({ roles: ['NationalCoordinator'] })
    ).toBe(true);
  });

  test('should restrict every local role', () => {
    expect(
      programmingSubPlansAreRestricted({ roles: ['RegionalCoordinator'] })
    ).toBe(true);
    expect(programmingSubPlansAreRestricted({ roles: ['Sampler'] })).toBe(true);
  });

  test('should not restrict administrators and laboratories', () => {
    expect(
      programmingSubPlansAreRestricted({ roles: ['AdministratorMaestro'] })
    ).toBe(false);
    expect(
      programmingSubPlansAreRestricted({ roles: ['AdministratorBGIR'] })
    ).toBe(false);
    expect(
      programmingSubPlansAreRestricted({ roles: ['LaboratoryUser'] })
    ).toBe(false);
    expect(
      programmingSubPlansAreRestricted({ roles: ['LaboratoryOffice'] })
    ).toBe(false);
  });
});
