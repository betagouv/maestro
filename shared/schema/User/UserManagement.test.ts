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
  managementScope,
  mergeManagedStages
} from './UserManagement';

const PPVStages = PPVValidatedSubPlanFixture.stages;
const AbattoirStages = DAOAVolailleValidatedSubPlanFixture.stages;

const Department1 = Regions[Region1Fixture].departments[0];
const Department2 = Regions[Region1Fixture].departments[1];

const admin = genUser({
  roles: ['AdministratorMaestro'],
  region: null,
  department: null,
  programmingSubPlans: []
});

const adminBGIR = genUser({
  roles: ['AdministratorBGIR'],
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
      expect(managementScope({ roles: ['AdministratorMaestro'] })).toBe(
        'national'
      );
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
      expect(canManageUsers({ roles: ['AdministratorMaestro'] })).toBe(true);
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

    test('should refuse a target sharing no stage', () => {
      const daoaSampler = genUser({
        roles: ['Sampler'],
        region: Region1Fixture,
        department: Department1,
        programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
      });

      expect(canManageUser(regionalCoordinator, daoaSampler)).toBe(false);
    });

    test('should not constrain an administrator carrying stages', () => {
      const adminWithSubPlans = genUser({
        roles: ['AdministratorMaestro'],
        region: null,
        department: null,
        programmingSubPlans: [PPVValidatedSubPlanFixture]
      });
      const daoaSampler = genUser({
        roles: ['Sampler'],
        region: Region1Fixture,
        department: Department1,
        programmingSubPlans: [DAOAVolailleValidatedSubPlanFixture]
      });

      expect(canManageUser(adminWithSubPlans, daoaSampler)).toBe(true);
    });

    test('should refuse any target for a regional manager without stage', () => {
      const regionalCoordinatorWithoutSubPlan = genUser({
        roles: ['RegionalCoordinator'],
        region: Region1Fixture,
        department: null,
        programmingSubPlans: []
      });

      expect(
        canManageUser(regionalCoordinatorWithoutSubPlan, samplerInScope)
      ).toBe(false);
    });

    test('should accept a target sharing only one stage out of several', () => {
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
          stages: PPVStages
        })
      ).toBe(true);

      expect(
        canCreateUser(regionalCoordinator, {
          roles: ['NationalCoordinator'],
          region: null,
          department: null,
          stages: PPVStages
        })
      ).toBe(false);

      expect(
        canCreateUser(departmentalCoordinator, {
          roles: ['Sampler'],
          region: Region1Fixture,
          department: Department2,
          stages: PPVStages
        })
      ).toBe(false);
    });
  });

  describe('AdministratorBGIR privilege escalation', () => {
    test('should not be able to create a Maestro administrator', () => {
      expect(
        canCreateUser(adminBGIR, {
          roles: ['AdministratorMaestro'],
          region: null,
          department: null,
          stages: []
        })
      ).toBe(false);
    });

    test('should not be able to promote anyone to Maestro administrator', () => {
      expect(
        canManageUser(adminBGIR, {
          ...samplerInScope,
          roles: ['AdministratorMaestro']
        })
      ).toBe(false);
    });

    test('should not be able to manage an existing Maestro administrator', () => {
      expect(canManageUser(adminBGIR, admin)).toBe(false);
    });

    test('should still manage every other role, BGIR peers included', () => {
      expect(canManageUser(adminBGIR, samplerInScope)).toBe(true);
      expect(
        canCreateUser(adminBGIR, {
          roles: ['AdministratorBGIR'],
          region: null,
          department: null,
          stages: []
        })
      ).toBe(true);
    });
  });

  describe('mergeManagedStages', () => {
    test('should leave a national manager unconstrained', () => {
      expect(
        mergeManagedStages(admin, [...PPVStages, ...AbattoirStages])
      ).toEqual([...PPVStages, ...AbattoirStages]);
    });

    test('should drop the submitted stages outside the manager scope', () => {
      expect(
        mergeManagedStages(regionalCoordinator, [
          ...PPVStages,
          ...AbattoirStages
        ])
      ).toEqual(PPVStages);
    });

    test('should preserve the current stages outside the manager scope', () => {
      expect(
        mergeManagedStages(
          regionalCoordinator,
          [],
          [...PPVStages, ...AbattoirStages]
        )
      ).toEqual(AbattoirStages);
    });
  });
});
