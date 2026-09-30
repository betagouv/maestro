import {
  FoieDeBovinPrescriptionFixture,
  PrescriptionFixture,
  VolaillePrescriptionFixture
} from 'maestro-shared/test/prescriptionFixtures';
import {
  DAOAInProgressBovinSubPlanId,
  DAOAInProgressProgrammingPlanFixture,
  DAOAInProgressVolailleSubPlanId
} from 'maestro-shared/test/programmingPlanFixtures';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import prescriptionRepository, {
  Prescriptions
} from './prescriptionRepository';

const daoaPrescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture
];

beforeAll(async () => {
  await Prescriptions().insert(daoaPrescriptions);
});

afterAll(async () => {
  await Prescriptions()
    .whereIn(
      'id',
      daoaPrescriptions.map(({ id }) => id)
    )
    .delete();
});

describe('findMany', () => {
  test('should find the prescriptions whose sub-plan selects one of the matrix kinds', async () => {
    const prescriptions = await prescriptionRepository.findMany({
      matrixKinds: ['A01SN', 'A01QX']
    });

    expect(prescriptions.map(({ id }) => id).toSorted()).toStrictEqual(
      daoaPrescriptions.map(({ id }) => id).toSorted()
    );
  });

  test('should exclude the prescriptions whose sub-plan selects none of the matrix kinds', async () => {
    const prescriptions = await prescriptionRepository.findMany({
      matrixKinds: ['A00GY']
    });

    expect(prescriptions.map(({ id }) => id)).toStrictEqual([
      PrescriptionFixture.id
    ]);
  });
});

describe('findCounts', () => {
  test('should give the matrix kinds of the sub-plan of each prescription', async () => {
    const rows = await prescriptionRepository.findCounts({
      programmingPlanIds: [DAOAInProgressProgrammingPlanFixture.id]
    });

    expect(
      rows.map(({ subPlanId, matrixKinds }) => ({ subPlanId, matrixKinds }))
    ).toStrictEqual(
      expect.arrayContaining([
        { subPlanId: DAOAInProgressBovinSubPlanId, matrixKinds: ['A01QX'] },
        { subPlanId: DAOAInProgressVolailleSubPlanId, matrixKinds: ['A01SN'] }
      ])
    );
    expect(rows).toHaveLength(2);
  });
});
