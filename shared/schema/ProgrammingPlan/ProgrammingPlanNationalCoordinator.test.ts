import { describe, expect, test } from 'vitest';
import { NationalCoordinatorId } from '../../test/programmingPlanFixtures';
import { UserRoleList } from '../User/UserRole';
import { canUpdateProgrammingPlanSettings } from './ProgrammingPlanNationalCoordinator';

const administratorRoles = ['AdministratorMaestro', 'AdministratorBGIR'];

const programmingPlan = {
  nationalCoordinators: [{ id: NationalCoordinatorId, name: 'Nadia' }]
};

describe('canUpdateProgrammingPlanSettings', () => {
  test.each(UserRoleList)(
    'should let a national coordinator of the plan update it (%s)',
    (userRole) => {
      expect(
        canUpdateProgrammingPlanSettings(
          programmingPlan,
          { id: NationalCoordinatorId },
          userRole
        )
      ).toBe(true);
    }
  );

  test.each(UserRoleList)(
    'should only let an administrator update a plan they do not coordinate (%s)',
    (userRole) => {
      expect(
        canUpdateProgrammingPlanSettings(
          programmingPlan,
          { id: '11111111-1111-1111-1111-111111111111' },
          userRole
        )
      ).toBe(administratorRoles.includes(userRole));
    }
  );

  test('should let nobody but an administrator update a plan without any coordinator', () => {
    expect(
      canUpdateProgrammingPlanSettings(
        { nationalCoordinators: [] },
        { id: NationalCoordinatorId },
        'NationalCoordinator'
      )
    ).toBe(false);
    expect(
      canUpdateProgrammingPlanSettings(
        { nationalCoordinators: [] },
        { id: NationalCoordinatorId },
        'AdministratorBGIR'
      )
    ).toBe(true);
  });
});
