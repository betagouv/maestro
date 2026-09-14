import {
  ProgrammingPlanDomain,
  type ProgrammingPlanDomainCreateInput,
  type ProgrammingPlanDomainId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { kysely } from './kysely';

const findMany = async (trx = kysely): Promise<ProgrammingPlanDomain[]> => {
  const domains = await trx
    .selectFrom('programmingPlanDomains')
    .selectAll()
    .orderBy('label')
    .orderBy('year')
    .execute();

  return ProgrammingPlanDomain.array().parse(domains);
};

const findUnique = async (
  id: ProgrammingPlanDomainId,
  trx = kysely
): Promise<ProgrammingPlanDomain | undefined> => {
  const domain = await trx
    .selectFrom('programmingPlanDomains')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();

  return domain ? ProgrammingPlanDomain.parse(domain) : undefined;
};

const insert = async (
  domain: ProgrammingPlanDomainCreateInput,
  trx = kysely
): Promise<ProgrammingPlanDomain> => {
  const createdDomain = await trx
    .insertInto('programmingPlanDomains')
    .values(domain)
    .returningAll()
    .executeTakeFirstOrThrow();

  return ProgrammingPlanDomain.parse(createdDomain);
};

const deleteOne = async (id: ProgrammingPlanDomainId): Promise<void> => {
  console.info('Delete programming plan domain', id);

  await kysely
    .deleteFrom('programmingPlanDomains')
    .where('id', '=', id)
    .execute();
};

export const programmingPlanDomainRepository = {
  findMany,
  findUnique,
  insert,
  deleteOne
};
