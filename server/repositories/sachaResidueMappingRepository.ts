import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { kysely } from './kysely';
import { SachaResidueId } from './kysely.type';

const findByLabel = async (label: SachaResidueId): Promise<SSD2Id | null> => {
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
