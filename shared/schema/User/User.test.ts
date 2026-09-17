import { describe, expect, test } from 'vitest';
import { SlaughterhouseCompanyFixture1 } from '../../test/companyFixtures';
import { genUser, Region1Fixture } from '../../test/userFixtures';
import {
  canSignIn,
  certificationIsRequired,
  programmingSubPlansAreRestricted,
  regionIsRequired,
  stagesIsRequired,
  UserRefined
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

describe('regionIsRequired', () => {
  test('should be required for regional, departmental and sampler roles', () => {
    expect(regionIsRequired({ roles: ['RegionalCoordinator'] })).toBe(true);
    expect(regionIsRequired({ roles: ['DepartmentalObserver'] })).toBe(true);
    expect(regionIsRequired({ roles: ['Sampler'] })).toBe(true);
  });

  test('should not be required for national roles', () => {
    expect(regionIsRequired({ roles: ['NationalCoordinator'] })).toBe(false);
    expect(regionIsRequired({ roles: ['AdministratorMaestro'] })).toBe(false);
  });
});

describe('UserRefined department', () => {
  test('should refuse a department for a sampler who does not work in a slaughterhouse', () => {
    const result = UserRefined.safeParse(
      genUser({
        roles: ['Sampler'],
        stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
        region: Region1Fixture,
        department: '08'
      })
    );

    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        path: ['department'],
        message: 'Ce rôle ne peut pas être lié à un département.'
      })
    ]);
  });

  test('should accept a sampler without department who does not work in a slaughterhouse', () => {
    const result = UserRefined.safeParse(
      genUser({
        roles: ['Sampler'],
        stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
        region: Region1Fixture,
        department: null
      })
    );

    expect(result.success).toBe(true);
  });

  test('should require a region for a sampler who does not work in a slaughterhouse', () => {
    const result = UserRefined.safeParse(
      genUser({
        roles: ['Sampler'],
        stages: ['PRODUCTION_PRIMAIRE_VEGETALE'],
        region: null,
        department: null
      })
    );

    expect(result.error?.issues).toEqual([
      expect.objectContaining({ path: ['region'] })
    ]);
  });

  test('should accept a department for a sampler working in a slaughterhouse', () => {
    const result = UserRefined.safeParse(
      genUser({
        roles: ['Sampler'],
        stages: ['ABATTAGE', 'PRODUCTION_PRIMAIRE_VEGETALE'],
        region: Region1Fixture,
        department: '08',
        companies: [SlaughterhouseCompanyFixture1]
      })
    );

    expect(result.success).toBe(true);
  });
});
