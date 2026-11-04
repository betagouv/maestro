import type { MatrixKind } from 'maestro-shared/schema/Matrix/MatrixReferential';
import { pendingChangeVisibilityForRole } from 'maestro-shared/schema/User/UserRole';
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
import { genUser } from 'maestro-shared/test/userFixtures';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import localPrescriptionChangeRepository from './localPrescriptionChangeRepository';
import localPrescriptionRepository, {
  LocalPrescriptions
} from './localPrescriptionRepository';
import prescriptionRepository, {
  Prescriptions
} from './prescriptionRepository';
import { userRepository } from './userRepository';

const daoaPrescriptions = [
  FoieDeBovinPrescriptionFixture,
  VolaillePrescriptionFixture
];

beforeAll(async () => {
  await Prescriptions().insert(daoaPrescriptions);
  await localPrescriptionRepository.insertMany([
    {
      prescriptionId: FoieDeBovinPrescriptionFixture.id,
      region: '44',
      sampleCount: 3
    }
  ]);
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
      matrixKinds: ['A01SN', 'A01QX'] as MatrixKind[]
    });

    expect(prescriptions.map(({ id }) => id).toSorted()).toStrictEqual(
      daoaPrescriptions.map(({ id }) => id).toSorted()
    );
  });

  test('should exclude the prescriptions whose sub-plan selects none of the matrix kinds', async () => {
    const prescriptions = await prescriptionRepository.findMany({
      matrixKinds: ['A00GY'] as MatrixKind[]
    });

    expect(prescriptions.map(({ id }) => id)).toStrictEqual([
      PrescriptionFixture.id
    ]);
  });
});

describe('findMany missingDistribution', () => {
  test('should find in a region the slaughterhouse prescriptions not distributed to the departments, and never the others', async () => {
    const prescriptions = await prescriptionRepository.findMany({
      region: '44',
      missingDistribution: true
    });

    expect(prescriptions.map(({ id }) => id)).toStrictEqual([
      FoieDeBovinPrescriptionFixture.id
    ]);
  });
});

describe('findMany subPlanStage', () => {
  test('should find the prescriptions whose sub-plan selects the stage, and exclude the others', async () => {
    const prescriptions = await prescriptionRepository.findMany({
      subPlanStage: 'ABATTAGE'
    });

    expect(prescriptions.map(({ id }) => id).toSorted()).toStrictEqual(
      daoaPrescriptions.map(({ id }) => id).toSorted()
    );
  });
});

describe('findMany coordinatorIds', () => {
  test('should find the prescriptions whose sub-plan shares a stage with the coordinators, and exclude the others', async () => {
    const coordinator = genUser({
      roles: ['NationalCoordinator'],
      stages: ['ABATTAGE']
    });
    await userRepository.insert(coordinator);

    const prescriptions = await prescriptionRepository.findMany({
      coordinatorIds: [coordinator.id]
    });

    expect(prescriptions.map(({ id }) => id).toSorted()).toStrictEqual(
      daoaPrescriptions.map(({ id }) => id).toSorted()
    );
  });
});

describe('findMany missingDistribution in a department', () => {
  const departmentalPrescriptions = [
    FoieDeBovinPrescriptionFixture,
    PrescriptionFixture
  ].map(({ id }) => ({
    prescriptionId: id,
    region: '44' as const,
    department: '44' as const,
    sampleCount: 2
  }));

  beforeAll(async () => {
    await localPrescriptionRepository.insertMany(departmentalPrescriptions);
  });

  afterAll(async () => {
    await LocalPrescriptions()
      .where({ region: '44', department: '44', companySiret: 'None' })
      .whereIn(
        'prescriptionId',
        departmentalPrescriptions.map(({ prescriptionId }) => prescriptionId)
      )
      .delete();
  });

  test('should find the slaughterhouse prescriptions not distributed to the slaughterhouses, and never the others', async () => {
    const prescriptions = await prescriptionRepository.findMany({
      region: '44',
      department: '44',
      missingDistribution: true
    });

    expect(prescriptions.map(({ id }) => id)).toStrictEqual([
      FoieDeBovinPrescriptionFixture.id
    ]);
  });
});

describe('findMany withSampleCountOnly', () => {
  test('should find in a region the prescriptions whose last unapplied change has samples, and exclude those brought back to 0', async () => {
    const regionalChange = {
      prescriptionId: VolaillePrescriptionFixture.id,
      echelon: 'Regional' as const,
      kind: 'sampleCount' as const,
      previousSampleCount: null
    };
    await localPrescriptionChangeRepository.insertMany([
      {
        ...regionalChange,
        region: '44',
        sampleCount: 2,
        changedAt: new Date('2026-10-01T10:00:00+02:00')
      },
      {
        ...regionalChange,
        region: '44',
        sampleCount: 0,
        changedAt: new Date('2026-10-02T10:00:00+02:00')
      },
      {
        ...regionalChange,
        region: '52',
        sampleCount: 0,
        changedAt: new Date('2026-10-01T10:00:00+02:00')
      },
      {
        ...regionalChange,
        region: '52',
        sampleCount: 2,
        changedAt: new Date('2026-10-02T10:00:00+02:00')
      }
    ]);
    const visibility = pendingChangeVisibilityForRole('RegionalCoordinator');

    const [inGrandEst, inPaysDeLaLoire] = await Promise.all(
      (['44', '52'] as const).map(async (region) =>
        (
          await prescriptionRepository.findMany(
            { region, withSampleCountOnly: true },
            visibility
          )
        ).map(({ id }) => id)
      )
    );

    expect(inGrandEst).toContain(FoieDeBovinPrescriptionFixture.id);
    expect(inGrandEst).not.toContain(VolaillePrescriptionFixture.id);
    expect(inPaysDeLaLoire).toContain(VolaillePrescriptionFixture.id);
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
        {
          subPlanId: DAOAInProgressBovinSubPlanId,
          matrixKinds: ['A01QX'] as MatrixKind[]
        },
        {
          subPlanId: DAOAInProgressVolailleSubPlanId,
          matrixKinds: ['A01SN'] as MatrixKind[]
        }
      ])
    );
    expect(rows).toHaveLength(2);
  });
});
