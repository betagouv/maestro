import { difference } from 'lodash-es';
import { describe, expect, test } from 'vitest';
import { UserRolePermissions } from './UserRole';

describe('UserRole', () => {
  describe('AdministratorBGIR', () => {
    const bgirPermissions = UserRolePermissions.AdministratorBGIR;
    const maestroPermissions = UserRolePermissions.AdministratorMaestro;

    test('should not be able to use mascarade, notices, descriptors, laboratory config and programming plan settings', () => {
      expect(difference(maestroPermissions, bgirPermissions)).toEqual([
        'manageMascarade',
        'manageNotices',
        'manageSpecificDataFields',
        'manageLaboratoryConfig',
        // FIXME à retirer quand les AdministratorBGIR auront cette permission
        'manageProgrammingPlanSettings'
      ]);
    });

    test('should have every other permission of the Maestro administrator', () => {
      expect(difference(bgirPermissions, maestroPermissions)).toEqual([]);
    });
  });
});
