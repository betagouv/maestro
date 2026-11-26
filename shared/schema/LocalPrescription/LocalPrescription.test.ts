import { describe, expect, test } from 'vitest';
import { SlaughterhouseCompanyFixture1 } from '../../test/companyFixtures';
import { genLocalPrescription } from '../../test/prescriptionFixtures';
import {
  ALANProgrammingPlanFixture,
  DAOAValidatedProgrammingPlanFixture,
  genProgrammingSubPlan
} from '../../test/programmingPlanFixtures';
import {
  filteredLocalPrescriptions,
  hasLocalPrescriptionPermission
} from './LocalPrescription';

describe('filteredLocalPrescriptions', () => {
  const regionalPrescriptionId = '11111111-1111-1111-1111-111111111111';
  const slaughterhousePrescriptionId = '22222222-2222-2222-2222-222222222222';

  const regionalLocalPrescription = genLocalPrescription({
    prescriptionId: regionalPrescriptionId,
    region: '44'
  });
  const slaughterhouseRegionalLocalPrescription = genLocalPrescription({
    prescriptionId: slaughterhousePrescriptionId,
    region: '44'
  });
  const slaughterhouseDepartmentalLocalPrescription = genLocalPrescription({
    prescriptionId: slaughterhousePrescriptionId,
    region: '44',
    department: '08'
  });
  const slaughterhouseCompanyLocalPrescription = genLocalPrescription({
    prescriptionId: slaughterhousePrescriptionId,
    region: '44',
    department: '08',
    companySiret: SlaughterhouseCompanyFixture1.siret
  });

  const localPrescriptions = [
    regionalLocalPrescription,
    slaughterhouseRegionalLocalPrescription,
    slaughterhouseDepartmentalLocalPrescription,
    slaughterhouseCompanyLocalPrescription
  ];

  test('should keep the regional level of the regional prescriptions for a user with a department', () => {
    expect(
      filteredLocalPrescriptions(localPrescriptions, {
        region: '44',
        department: '08',
        regionalPrescriptionIds: [regionalPrescriptionId]
      })
    ).toEqual([
      regionalLocalPrescription,
      slaughterhouseDepartmentalLocalPrescription
    ]);
  });

  test('should keep the regional level of the regional prescriptions for a user with a department and companies', () => {
    expect(
      filteredLocalPrescriptions(localPrescriptions, {
        region: '44',
        department: '08',
        companies: [SlaughterhouseCompanyFixture1],
        regionalPrescriptionIds: [regionalPrescriptionId]
      })
    ).toEqual([
      regionalLocalPrescription,
      slaughterhouseCompanyLocalPrescription
    ]);
  });

  test('should keep the regional level for a user without department', () => {
    expect(
      filteredLocalPrescriptions(localPrescriptions, {
        region: '44',
        regionalPrescriptionIds: [regionalPrescriptionId]
      })
    ).toEqual([
      regionalLocalPrescription,
      slaughterhouseRegionalLocalPrescription
    ]);
  });
});

describe('hasLocalPrescriptionPermission — DEPARTMENTAL plan (ALAN)', () => {
  const departmentRow = { region: '44' as const, department: '08' as const };

  test('the regional coordinator distributes to the departments, like a slaughterhouse plan', () => {
    expect(
      hasLocalPrescriptionPermission(
        { region: '44', department: null },
        'RegionalCoordinator',
        ALANProgrammingPlanFixture,
        ALANProgrammingPlanFixture.subPlans[0],
        departmentRow
      ).distributeToDepartments
    ).toBe(true);
  });

  test('the departmental coordinator assigns the laboratories of its own department row', () => {
    expect(
      hasLocalPrescriptionPermission(
        { region: '44', department: '08' },
        'DepartmentalCoordinator',
        ALANProgrammingPlanFixture,
        ALANProgrammingPlanFixture.subPlans[0],
        departmentRow
      ).updateLaboratories
    ).toBe(true);
  });

  test('the departmental coordinator has no volume to fill in', () => {
    expect(
      hasLocalPrescriptionPermission(
        { region: '44', department: '08' },
        'DepartmentalCoordinator',
        ALANProgrammingPlanFixture,
        ALANProgrammingPlanFixture.subPlans[0],
        departmentRow
      ).updateSampleCount
    ).toBe(false);
  });

  test('no abattoir split, unlike a slaughterhouse plan', () => {
    expect(
      hasLocalPrescriptionPermission(
        { region: '44', department: '08' },
        'DepartmentalCoordinator',
        ALANProgrammingPlanFixture,
        ALANProgrammingPlanFixture.subPlans[0],
        departmentRow
      ).distributeToSlaughterhouses
    ).toBe(false);
    expect(
      hasLocalPrescriptionPermission(
        { region: '44', department: '08' },
        'DepartmentalCoordinator',
        DAOAValidatedProgrammingPlanFixture,
        DAOAValidatedProgrammingPlanFixture.subPlans[0],
        departmentRow
      ).distributeToSlaughterhouses
    ).toBe(true);
  });

  test('no abattoir split for a sub-plan outside the slaughter stage of a slaughterhouse plan', () => {
    expect(
      hasLocalPrescriptionPermission(
        { region: '44', department: '08' },
        'DepartmentalCoordinator',
        DAOAValidatedProgrammingPlanFixture,
        genProgrammingSubPlan({
          programmingPlanId: DAOAValidatedProgrammingPlanFixture.id,
          subPlanNumber: 'M03',
          stages: [{ stage: 'ELEVAGE', subStages: [] }]
        }),
        departmentRow
      ).distributeToSlaughterhouses
    ).toBe(false);
  });
});
