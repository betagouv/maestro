import { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import { kysely } from './kysely';
import { LaboratoryResidueMapping } from './kysely.type';

const findByLaboratoryShortName = async (
  laboratoryShortName: LaboratoryShortName
): Promise<LaboratoryResidueMapping[]> => {
  return kysely
    .selectFrom('laboratoryResidueMappings')
    .leftJoin(
      'laboratories',
      'laboratories.id',
      'laboratoryResidueMappings.laboratoryId'
    )
    .selectAll()
    .where('laboratories.shortName', '=', laboratoryShortName)
    .execute();
};

export const laboratoryResidueMappingRepository = {
  findByLaboratoryShortName
};
