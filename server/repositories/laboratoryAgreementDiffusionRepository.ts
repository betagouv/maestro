import type { LaboratoryAgreementDiffusion } from 'maestro-shared/schema/Laboratory/LaboratoryAgreementDiffusion';
import { kysely } from './kysely';

const findMany = async (): Promise<LaboratoryAgreementDiffusion[]> =>
  kysely
    .selectFrom('laboratoryAgreementDiffusions')
    .selectAll()
    .orderBy('year', 'desc')
    .execute();

const findUnique = async (
  year: number
): Promise<LaboratoryAgreementDiffusion | undefined> =>
  kysely
    .selectFrom('laboratoryAgreementDiffusions')
    .selectAll()
    .where('year', '=', year)
    .executeTakeFirst();

const insert = async (
  year: number,
  diffusedBy: string
): Promise<LaboratoryAgreementDiffusion> => {
  console.info('Diffuse laboratory agreements', year, diffusedBy);
  return kysely
    .insertInto('laboratoryAgreementDiffusions')
    .values({ year, diffusedAt: new Date(), diffusedBy })
    .returningAll()
    .executeTakeFirstOrThrow();
};

export default {
  findMany,
  findUnique,
  insert
};
