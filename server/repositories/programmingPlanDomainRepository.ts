import {
  ProgrammingPlanDomain,
  type ProgrammingPlanDomainId
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanDomain';
import { kysely } from './kysely';

const findMany = async (trx = kysely): Promise<ProgrammingPlanDomain[]> => {
  const domains = await trx
    .selectFrom('programmingPlanDomains')
    .selectAll()
    .orderBy('label')
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

export const programmingPlanDomainRepository = { findMany, findUnique };
