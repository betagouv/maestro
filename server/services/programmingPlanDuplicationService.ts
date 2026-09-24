import type { Transaction } from 'kysely';
import type { ProgrammingPlanDomainId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { v4 as uuidv4 } from 'uuid';
import { executeTransaction } from '../repositories/kysely';
import type { DB } from '../repositories/kysely.type';
import { toProgrammingPlanSettingsRow } from '../repositories/programmingPlanSettingsRow';

const COPY_SUFFIX = '(copie)';

const copiedLabel = (label: string) => `${label} ${COPY_SUFFIX}`;

export const nextSubPlanNumber = (
  sourceSubPlanNumber: string,
  existingSubPlanNumbers: string[]
): string => {
  const [, prefix, digits] =
    sourceSubPlanNumber.match(/^(.*?)(\d*)$/) ?? ([] as string[]);
  const width = digits?.length || 2;
  const taken = new Set(existingSubPlanNumbers);

  let index = digits ? Number(digits) + 1 : 1;
  let candidate = `${prefix}${String(index).padStart(width, '0')}`;

  while (taken.has(candidate)) {
    index += 1;
    candidate = `${prefix}${String(index).padStart(width, '0')}`;
  }

  return candidate;
};

const duplicateSubPlanFields = async (
  trx: Transaction<DB>,
  sourceSubPlanId: ProgrammingSubPlanId,
  copiedSubPlanId: ProgrammingSubPlanId
): Promise<void> => {
  const fields = await trx
    .selectFrom('programmingSubPlanFieldsRaw')
    .selectAll()
    .where('programmingSubPlanId', '=', sourceSubPlanId)
    .execute();

  for (const { id, ...field } of fields) {
    const { id: copiedFieldId } = await trx
      .insertInto('programmingSubPlanFieldsRaw')
      .values({ ...field, programmingSubPlanId: copiedSubPlanId })
      .returning('id')
      .executeTakeFirstOrThrow();

    const options = await trx
      .selectFrom('programmingSubPlanFieldOptions')
      .selectAll()
      .where('programmingSubPlanFieldId', '=', id)
      .execute();

    if (options.length > 0) {
      await trx
        .insertInto('programmingSubPlanFieldOptions')
        .values(
          options.map((option) => ({
            ...option,
            programmingSubPlanFieldId: copiedFieldId
          }))
        )
        .execute();
    }
  }
};

const duplicatePlanFields = async (
  trx: Transaction<DB>,
  sourcePlanId: string,
  copiedPlanId: string
): Promise<void> => {
  const fields = await trx
    .selectFrom('programmingPlanFields')
    .selectAll()
    .where('programmingPlanId', '=', sourcePlanId)
    .execute();

  for (const { id, ...field } of fields) {
    const { id: copiedFieldId } = await trx
      .insertInto('programmingPlanFields')
      .values({ ...field, programmingPlanId: copiedPlanId })
      .returning('id')
      .executeTakeFirstOrThrow();

    const options = await trx
      .selectFrom('programmingPlanFieldOptions')
      .selectAll()
      .where('programmingPlanFieldId', '=', id)
      .execute();

    if (options.length > 0) {
      await trx
        .insertInto('programmingPlanFieldOptions')
        .values(
          options.map((option) => ({
            ...option,
            programmingPlanFieldId: copiedFieldId
          }))
        )
        .execute();
    }
  }
};

const duplicateLaboratoryAgreements = async (
  trx: Transaction<DB>,
  sourceSubPlanId: ProgrammingSubPlanId,
  copiedSubPlanId: ProgrammingSubPlanId
): Promise<void> => {
  const agreements = await trx
    .selectFrom('laboratoryAgreements')
    .selectAll()
    .where('programmingSubPlanId', '=', sourceSubPlanId)
    .execute();

  if (agreements.length > 0) {
    await trx
      .insertInto('laboratoryAgreements')
      .values(
        agreements.map((agreement) => ({
          ...agreement,
          programmingSubPlanId: copiedSubPlanId
        }))
      )
      .execute();
  }

  const checks = await trx
    .selectFrom('laboratoryAgreementChecks')
    .selectAll()
    .where('programmingSubPlanId', '=', sourceSubPlanId)
    .execute();

  if (checks.length > 0) {
    await trx
      .insertInto('laboratoryAgreementChecks')
      .values(
        checks.map((check) => ({
          ...check,
          programmingSubPlanId: copiedSubPlanId
        }))
      )
      .execute();
  }
};

const duplicateSubPlanWithin = async (
  trx: Transaction<DB>,
  sourceSubPlanId: ProgrammingSubPlanId,
  targetPlanId: string,
  subPlanNumber: string
): Promise<ProgrammingSubPlanId> => {
  const { id, ...sourceSubPlan } = await trx
    .selectFrom('programmingSubPlansRaw')
    .selectAll()
    .where('id', '=', sourceSubPlanId)
    .executeTakeFirstOrThrow();

  const copiedSubPlanId = uuidv4() as ProgrammingSubPlanId;

  await trx
    .insertInto('programmingSubPlansRaw')
    .values({
      ...toProgrammingPlanSettingsRow(sourceSubPlan),
      id: copiedSubPlanId,
      programmingPlanId: targetPlanId,
      subPlanNumber,
      settingsCompleted: false
    })
    .execute();

  await duplicateSubPlanFields(trx, id, copiedSubPlanId);
  await duplicateLaboratoryAgreements(trx, id, copiedSubPlanId);

  return copiedSubPlanId;
};

const duplicatePlanWithin = async (
  trx: Transaction<DB>,
  sourcePlanId: string,
  targetDomainId: ProgrammingPlanDomainId,
  createdBy: string,
  title: string
): Promise<string> => {
  const { id, ...sourcePlan } = await trx
    .selectFrom('programmingPlans')
    .selectAll()
    .where('id', '=', sourcePlanId)
    .executeTakeFirstOrThrow();

  const copiedPlanId = uuidv4();

  await trx
    .insertInto('programmingPlans')
    .values({
      ...toProgrammingPlanSettingsRow(sourcePlan),
      id: copiedPlanId,
      domainId: targetDomainId,
      title,
      settingsCompleted: false,
      createdAt: new Date(),
      createdBy,
      launchedAt: null,
      launchedBy: null
    })
    .execute();

  const localStatus = await trx
    .selectFrom('programmingPlanLocalStatus')
    .selectAll()
    .where('programmingPlanId', '=', sourcePlanId)
    .execute();

  if (localStatus.length > 0) {
    await trx
      .insertInto('programmingPlanLocalStatus')
      .values(
        localStatus.map((status) => ({
          ...status,
          programmingPlanId: copiedPlanId,
          status: 'InProgress',
          sentAt: null,
          lastSentAt: null,
          lastModifiedAt: null
        }))
      )
      .execute();
  }

  const coordinators = await trx
    .selectFrom('programmingPlanNationalCoordinators')
    .selectAll()
    .where('programmingPlanId', '=', sourcePlanId)
    .execute();

  if (coordinators.length > 0) {
    await trx
      .insertInto('programmingPlanNationalCoordinators')
      .values(
        coordinators.map((coordinator) => ({
          ...coordinator,
          programmingPlanId: copiedPlanId
        }))
      )
      .execute();
  }

  await duplicatePlanFields(trx, id, copiedPlanId);

  const subPlans = await trx
    .selectFrom('programmingSubPlansRaw')
    .select(['id', 'subPlanNumber'])
    .where('programmingPlanId', '=', sourcePlanId)
    .execute();

  for (const subPlan of subPlans) {
    await duplicateSubPlanWithin(
      trx,
      subPlan.id,
      copiedPlanId,
      subPlan.subPlanNumber
    );
  }

  return copiedPlanId;
};

const duplicateSubPlan = async (
  programmingSubPlanId: ProgrammingSubPlanId,
  programmingPlanId: string
): Promise<ProgrammingSubPlanId> =>
  executeTransaction(async (trx) => {
    const { subPlanNumber } = await trx
      .selectFrom('programmingSubPlansRaw')
      .select('subPlanNumber')
      .where('id', '=', programmingSubPlanId)
      .executeTakeFirstOrThrow();

    const siblings = await trx
      .selectFrom('programmingSubPlansRaw')
      .select('subPlanNumber')
      .where('programmingPlanId', '=', programmingPlanId)
      .execute();

    return duplicateSubPlanWithin(
      trx,
      programmingSubPlanId,
      programmingPlanId,
      nextSubPlanNumber(
        subPlanNumber,
        siblings.map((_) => _.subPlanNumber)
      )
    );
  });

const duplicatePlan = async (
  programmingPlanId: string,
  createdBy: string
): Promise<string> =>
  executeTransaction(async (trx) => {
    const { domainId, title } = await trx
      .selectFrom('programmingPlans')
      .select(['domainId', 'title'])
      .where('id', '=', programmingPlanId)
      .executeTakeFirstOrThrow();

    return duplicatePlanWithin(
      trx,
      programmingPlanId,
      domainId,
      createdBy,
      copiedLabel(title)
    );
  });

const duplicateDomain = async (
  programmingPlanDomainId: ProgrammingPlanDomainId,
  createdBy: string
): Promise<ProgrammingPlanDomainId> =>
  executeTransaction(async (trx) => {
    const { id, ...sourceDomain } = await trx
      .selectFrom('programmingPlanDomains')
      .selectAll()
      .where('id', '=', programmingPlanDomainId)
      .executeTakeFirstOrThrow();

    const copiedDomainId = uuidv4() as ProgrammingPlanDomainId;

    await trx
      .insertInto('programmingPlanDomains')
      .values({
        ...sourceDomain,
        id: copiedDomainId,
        label: copiedLabel(sourceDomain.label)
      })
      .execute();

    const plans = await trx
      .selectFrom('programmingPlans')
      .select(['id', 'title'])
      .where('domainId', '=', id)
      .execute();

    for (const plan of plans) {
      await duplicatePlanWithin(
        trx,
        plan.id,
        copiedDomainId,
        createdBy,
        plan.title
      );
    }

    return copiedDomainId;
  });

export const programmingPlanDuplicationService = {
  duplicateSubPlan,
  duplicatePlan,
  duplicateDomain
};
