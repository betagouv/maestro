import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import {
  defaultProgrammingPlanSample,
  type ProgrammingPlanSampleSetting
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSampleSetting';
import { ProgrammingPlanSettings } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanSettings';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  DAOAInProgressProgrammingPlanFixture,
  DAOAVolailleInProgressSubPlanFixture
} from 'maestro-shared/test/programmingPlanFixtures';
import { NationalCoordinatorDaoaFixture } from 'maestro-shared/test/userFixtures';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { kysely } from '../repositories/kysely';
import { programmingSubPlanRepository } from '../repositories/programmingSubPlanRepository';
import { programmingPlanDuplicationService } from './programmingPlanDuplicationService';

const sourcePlanId = DAOAInProgressProgrammingPlanFixture.id;
const sourceSubPlanId = DAOAVolailleInProgressSubPlanFixture.id;

const samples: ProgrammingPlanSampleSetting[] = [
  { ...defaultProgrammingPlanSample, substanceKinds: ['Mono'] }
];

const findOwnSettings = (id: ProgrammingSubPlanId) =>
  kysely
    .selectFrom('programmingSubPlansRaw')
    .select(ProgrammingPlanSettings.keyof().options)
    .where('id', '=', id)
    .executeTakeFirstOrThrow();

const createdSubPlanIds: ProgrammingSubPlanId[] = [];
const createdPlanIds: string[] = [];
const createdDomainIds: ProgrammingPlanDomainId[] = [];

const duplicateSubPlan = async () => {
  const id = await programmingPlanDuplicationService.duplicateSubPlan(
    sourceSubPlanId,
    sourcePlanId
  );
  createdSubPlanIds.push(id);
  return id;
};

const duplicatePlan = async () => {
  const id = await programmingPlanDuplicationService.duplicatePlan(
    sourcePlanId,
    NationalCoordinatorDaoaFixture.id
  );
  createdPlanIds.push(id);
  return id;
};

const duplicateDomain = async () => {
  const id = await programmingPlanDuplicationService.duplicateDomain(
    DAOAInProgressProgrammingPlanFixture.domainId,
    NationalCoordinatorDaoaFixture.id
  );
  createdDomainIds.push(id);
  return id;
};

beforeEach(async () => {
  await programmingSubPlanRepository.updateSettings(sourceSubPlanId, {
    samples,
    samplesManaged: true
  });
});

afterEach(async () => {
  const planIds = [
    ...createdPlanIds,
    ...(createdDomainIds.length > 0
      ? (
          await kysely
            .selectFrom('programmingPlans')
            .select('id')
            .where('domainId', 'in', createdDomainIds)
            .execute()
        ).map((_) => _.id)
      : [])
  ];

  if (planIds.length > 0) {
    await kysely
      .deleteFrom('programmingSubPlansRaw')
      .where('programmingPlanId', 'in', planIds)
      .execute();
    await kysely
      .deleteFrom('programmingPlanLocalStatus')
      .where('programmingPlanId', 'in', planIds)
      .execute();
    await kysely
      .deleteFrom('programmingPlanNationalCoordinators')
      .where('programmingPlanId', 'in', planIds)
      .execute();
    await kysely
      .deleteFrom('programmingPlans')
      .where('id', 'in', planIds)
      .execute();
  }

  if (createdSubPlanIds.length > 0) {
    await kysely
      .deleteFrom('programmingSubPlansRaw')
      .where('id', 'in', createdSubPlanIds)
      .execute();
  }

  if (createdDomainIds.length > 0) {
    await kysely
      .deleteFrom('programmingPlanDomains')
      .where('id', 'in', createdDomainIds)
      .execute();
  }

  createdSubPlanIds.length = 0;
  createdPlanIds.length = 0;
  createdDomainIds.length = 0;

  await programmingSubPlanRepository.updateSettings(sourceSubPlanId, {
    samples: DAOAVolailleInProgressSubPlanFixture.samples,
    samplesManaged: DAOAVolailleInProgressSubPlanFixture.samplesManaged
  });
});

describe('duplicateSubPlan', () => {
  test('should give the copy the number following the source', async () => {
    const copiedSubPlanId = await duplicateSubPlan();

    await expect(
      programmingSubPlanRepository.findUnique(copiedSubPlanId)
    ).resolves.toMatchObject({
      subPlanNumber: 'M03',
      label: DAOAVolailleInProgressSubPlanFixture.label,
      programmingPlanId: sourcePlanId
    });
  });

  test('should copy the own settings, samples included', async () => {
    const copiedSubPlanId = await duplicateSubPlan();

    await expect(findOwnSettings(copiedSubPlanId)).resolves.toStrictEqual(
      await findOwnSettings(sourceSubPlanId)
    );
  });

  test('should leave the copy in draft', async () => {
    const copiedSubPlanId = await duplicateSubPlan();

    await expect(
      programmingSubPlanRepository.findUnique(copiedSubPlanId)
    ).resolves.toMatchObject({ settingsCompleted: false });
  });

  test('should copy the sampler form fields and their options', async () => {
    const copiedSubPlanId = await duplicateSubPlan();

    const fieldsOf = (id: ProgrammingSubPlanId) =>
      kysely
        .selectFrom('programmingSubPlanFieldsRaw')
        .select(['fieldId', 'required', 'order', 'inheritance'])
        .where('programmingSubPlanId', '=', id)
        .orderBy('order')
        .execute();

    await expect(fieldsOf(copiedSubPlanId)).resolves.toStrictEqual(
      await fieldsOf(sourceSubPlanId)
    );

    const optionCountOf = async (id: ProgrammingSubPlanId) =>
      (
        await kysely
          .selectFrom('programmingSubPlanFieldOptions')
          .innerJoin(
            'programmingSubPlanFieldsRaw',
            'programmingSubPlanFieldsRaw.id',
            'programmingSubPlanFieldOptions.programmingSubPlanFieldId'
          )
          .select('specificDataFieldOptionId')
          .where('programmingSubPlanFieldsRaw.programmingSubPlanId', '=', id)
          .execute()
      ).length;

    await expect(optionCountOf(copiedSubPlanId)).resolves.toBe(
      await optionCountOf(sourceSubPlanId)
    );
  });

  test('should copy the laboratory agreements', async () => {
    const copiedSubPlanId = await duplicateSubPlan();

    const agreementsOf = (id: ProgrammingSubPlanId) =>
      kysely
        .selectFrom('laboratoryAgreements')
        .select(['laboratoryId', 'substanceKind', 'detectionAnalysis'])
        .where('programmingSubPlanId', '=', id)
        .orderBy(['laboratoryId', 'substanceKind'])
        .execute();

    await expect(agreementsOf(copiedSubPlanId)).resolves.toStrictEqual(
      await agreementsOf(sourceSubPlanId)
    );
  });

  test('should not carry any prescription over', async () => {
    const copiedSubPlanId = await duplicateSubPlan();

    await expect(
      kysely
        .selectFrom('prescriptions')
        .select('id')
        .where('programmingSubPlanId', '=', copiedSubPlanId)
        .execute()
    ).resolves.toStrictEqual([]);
  });
});

describe('duplicatePlan', () => {
  test('should suffix the title and keep the domain and the campaign', async () => {
    const copiedPlanId = await duplicatePlan();

    await expect(
      kysely
        .selectFrom('programmingPlans')
        .select([
          'title',
          'domainId',
          'year',
          'settingsCompleted',
          'launchedAt'
        ])
        .where('id', '=', copiedPlanId)
        .executeTakeFirstOrThrow()
    ).resolves.toMatchObject({
      title: `${DAOAInProgressProgrammingPlanFixture.title} (copie)`,
      domainId: DAOAInProgressProgrammingPlanFixture.domainId,
      year: DAOAInProgressProgrammingPlanFixture.year,
      settingsCompleted: false,
      launchedAt: null
    });
  });

  test('should reset every local status', async () => {
    const copiedPlanId = await duplicatePlan();

    const statuses = await kysely
      .selectFrom('programmingPlanLocalStatus')
      .select(['status', 'sentAt', 'lastSentAt'])
      .where('programmingPlanId', '=', copiedPlanId)
      .execute();

    expect(statuses.length).toBeGreaterThan(0);
    for (const status of statuses) {
      expect(status).toStrictEqual({
        status: 'InProgress',
        sentAt: null,
        lastSentAt: null
      });
    }
  });

  test('should copy the national coordinators', async () => {
    const copiedPlanId = await duplicatePlan();

    const coordinatorsOf = (planId: string) =>
      kysely
        .selectFrom('programmingPlanNationalCoordinators')
        .select('userId')
        .where('programmingPlanId', '=', planId)
        .orderBy('userId')
        .execute();

    await expect(coordinatorsOf(copiedPlanId)).resolves.toStrictEqual(
      await coordinatorsOf(sourcePlanId)
    );
  });

  test('should copy the sub-plans keeping their numbers', async () => {
    const copiedPlanId = await duplicatePlan();

    const numbersOf = async (planId: string) =>
      (
        await kysely
          .selectFrom('programmingSubPlansRaw')
          .select('subPlanNumber')
          .where('programmingPlanId', '=', planId)
          .orderBy('subPlanNumber')
          .execute()
      ).map((_) => _.subPlanNumber);

    await expect(numbersOf(copiedPlanId)).resolves.toStrictEqual(
      await numbersOf(sourcePlanId)
    );
  });
});

describe('duplicateDomain', () => {
  test('should suffix the domain label and keep the campaign', async () => {
    const copiedDomainId = await duplicateDomain();

    const source = await kysely
      .selectFrom('programmingPlanDomains')
      .selectAll()
      .where('id', '=', DAOAInProgressProgrammingPlanFixture.domainId)
      .executeTakeFirstOrThrow();

    await expect(
      kysely
        .selectFrom('programmingPlanDomains')
        .select(['label', 'year'])
        .where('id', '=', copiedDomainId)
        .executeTakeFirstOrThrow()
    ).resolves.toStrictEqual({
      label: `${source.label} (copie)`,
      year: source.year
    });
  });

  test('should copy its plans without suffixing their titles', async () => {
    const copiedDomainId = await duplicateDomain();

    const titlesOf = async (domainId: ProgrammingPlanDomainId) =>
      (
        await kysely
          .selectFrom('programmingPlans')
          .select('title')
          .where('domainId', '=', domainId)
          .orderBy('title')
          .execute()
      ).map((_) => _.title);

    await expect(titlesOf(copiedDomainId)).resolves.toStrictEqual(
      await titlesOf(DAOAInProgressProgrammingPlanFixture.domainId)
    );
  });
});
