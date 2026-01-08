import { kysely } from './kysely';

const findByLabel = async (label: string): Promise<string | null> => {
  const result = await kysely
    .selectFrom('sachaResidueMappings')
    .select('ssd2Id')
    .where('label', '=', label)
    .executeTakeFirst();

  return result?.ssd2Id ?? null;
};

export const sachaResidueMappingRepository = {
  findByLabel
};
