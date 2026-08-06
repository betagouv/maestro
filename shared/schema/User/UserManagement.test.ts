import { describe, expect, test } from 'vitest';
import { Regions } from '../../referential/Region';
import {
  DAOAVolailleValidatedSubPlanFixture,
  PPVValidatedSubPlanFixture
} from '../../test/programmingPlanFixtures';
import {
  genUser,
  Region1Fixture,
  Region2Fixture
} from '../../test/userFixtures';
import {
  canCreateUser,
  canManageUser,
  canManageUsers,
  ManageableUserRoles,
  manageableUserRoles,
  managementScope
} from './UserManagement';

const Department1 = Regions[Region1Fixture].departments[0];
const Department2 = Regions[Region1Fixture].departments[1];

const admin = genUser({
  roles: ['Administrator'],
  region: null,
  department: null,
  programmingSubPlans: []
});

const regionalCoordinator = genUser({
  roles: ['RegionalCoordinator'],
  region: Region1Fixture,
  department: null,
  programmingSubPlans: [PPVValidatedSubPlanFixture]
});

const departmentalCoordinator = genUser({
  roles: ['DepartmentalCoordinator'],
  region: Region1Fixture,
  department: Department1,
  programmingSubPlans: [PPVValidatedSubPlanFixture]
});

const samplerInScope = genUser({
  roles: ['Sampler'],
  region: Region1Fixture,
  department: Department1,
  programmingSubPlans: [PPVValidatedSubPlanFixture]
});

describe('UserManagement', () => {
  describe('managementScope', () => {
    test('should widen to the broadest role of the account', () => {
      expect(managementScope({ roles: ['Administrator'] })).toBe('national');
      expect(managementScope({ roles: ['RegionalCoordinator'] })).toBe(
        'regional'
      );
      expect(managementScope({ roles: ['DepartmentalCoordinator'] })).toBe(
        'departmental'
      );
      expect(
        managementScope({
          roles: ['DepartmentalCoordinator', 'RegionalCoordinator']
        })
      ).toBe('regional');
      expect(managementScope({ roles: ['Sampler'] })).toBe('none');
    });
  });

  describe('manageableUserRoles / canManageUsers', () => {
    test('should union the roles of every role of the account', () => {
      expect(
        manageableUserRoles({ roles: ['DepartmentalCoordinator', 'Sampler'] })
      ).toEqual(ManageableUserRoles.DepartmentalCoordinator);
    });

    test('should grant no management to roles without hierarchical power', () => {
      for (const role of [
        'NationalCoordinator',
        'NationalObserver',
        'RegionalObserver',
        'DepartmentalObserver',
        'Sampler',
        'LaboratoryUser',
        'LaboratoryOffice'
      ] as const) {
        expect(canManageUsers({ roles: [role] })).toBe(false);
      }
    });

    test('should grant management to hierarchical roles', () => {
      expect(canManageUsers({ roles: ['Administrator'] })).toBe(true);
      expect(canManageUsers({ roles: ['RegionalCoordinator'] })).toBe(true);
      expect(canManageUsers({ roles: ['DepartmentalCoordinator'] })).toBe(true);
    });
  });

  describe('canManageUser', () => {
    test('should never let a user manage themselves', () => {
      expect(canManageUser(admin, admin)).toBe(false);
      expect(canManageUser(regionalCoordinator, regionalCoordinator)).toBe(
        false
      );
    });

    test('should let an administrator manage anyone else', () => {
      expect(canManageUser(admin, regionalCoordinator)).toBe(true);
      expect(canManageUser(admin, samplerInScope)).toBe(true);
    });

    test('should let a regional coordinator manage their own region', () => {
      expect(canManageUser(regionalCoordinator, samplerInScope)).toBe(true);
      expect(canManageUser(regionalCoordinator, departmentalCoordinator)).toBe(
        true
      );
    });

    test('should refuse a target of another region', () => {
      const samplerOtherRegion = genUser({
        roles: ['Sampler'],
        region: Region2Fixture,
        department: Regions[Region2Fixture].departments[0],
        programmingSubPlans: [PPVValidatedSubPlanFixture]
      });

      expect(canManageUser(regionalCoordinator, samplerOtherRegion)).toBe(
        false
      );
    });

    test('should refuse a target of another department for a departmental coordinator', () => {
      const samplerOtherDepartment = genUser({
        roles: ['Sampler'],
        region: Region1Fixture,
        department: Department2,
        programmingSubPlans: [PPVValidatedSubPlanFixture]
      });

      expect(canManageUser(departmentalCoordinator, samplerInScope)).toBe(true);
      expect(
        canManageUser(departmentalCoordinator, samplerOtherDepartment)
      ).toBe(false);
    });

    test('should refuse a target holding a role above the manager', () => {
      const nationalCoordinator = genUser({
        roles: ['NationalCoordinator'],
        region: null,
        department: null,
        programmingSubPlans: [PPVValidatedSubPlanFixture]
      });

      expect(canManageUser(regionalCoordinator, admin)).toBe(false);
      expect(canManageUser(regionalCoordinator, nationalCoordinator)).toBe(
        false
      );
      expect(canManageUser(departmentalCoordinator, regionalCoordinator)).toBe(
        false
      );
    });

    test('should refuse a target carrying a role outside the matrix, even combined with a managed one', () => {
      const mixedTarget = genUser({
        roles: ['DepartmentalCoordinator', 'NationalObserver'],
        region: Region1Fixture,
        department: Department1,
        programmingSubPlans: [PPVValidatedSubPlanFixture]
      });

      expect(canManageUser(regionalCoordinator, mixedTarget)).toBe(false);
    });

    test('should refuse a target sharing no sub plan', () => {
      const daoaSampler = genUser({
        roles: ['Sampler'],
        region: Region1Fixture,
        department: Department1,
        programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
      });

      expect(canManageUser(regionalCoordinator, daoaSampler)).toBe(false);
    });

    test('should accept a target sharing only one sub plan out of several', () => {
      const multiPlanSampler = genUser({
        roles: ['Sampler'],
        region: Region1Fixture,
        department: Department1,
        programmingSubPlans: [
          PPVValidatedSubPlanFixture,
          DAOAVolailleValidatedSubPlanFixture
        ]
      });

      expect(canManageUser(regionalCoordinator, multiPlanSampler)).toBe(true);
    });

    test('should use the union of the roles rather than a single one', () => {
      const observerAndDepartmentalCoordinator = genUser({
        roles: ['NationalObserver', 'DepartmentalCoordinator'],
        region: Region1Fixture,
        department: Department1,
        programmingSubPlans: [PPVValidatedSubPlanFixture]
      });

      expect(
        canManageUser(observerAndDepartmentalCoordinator, samplerInScope)
      ).toBe(true);
    });
  });

  describe('canCreateUser', () => {
    test('should apply the same scope rules without the self check', () => {
      expect(
        canCreateUser(regionalCoordinator, {
          roles: ['Sampler'],
          region: Region1Fixture,
          department: Department1,
          programmingSubPlans: [PPVValidatedSubPlanFixture]
        })
      ).toBe(true);

      expect(
        canCreateUser(regionalCoordinator, {
          roles: ['NationalCoordinator'],
          region: null,
          department: null,
          programmingSubPlans: [PPVValidatedSubPlanFixture]
        })
      ).toBe(false);

      expect(
        canCreateUser(departmentalCoordinator, {
          roles: ['Sampler'],
          region: Region1Fixture,
          department: Department2,
          programmingSubPlans: [PPVValidatedSubPlanFixture]
        })
      ).toBe(false);
    });
  });
});
