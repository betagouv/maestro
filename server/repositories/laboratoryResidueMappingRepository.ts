import type { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import type { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { kysely } from './kysely';
import type { LaboratoryResidueMapping } from './kysely.type';

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

const findByLaboratoryId = async (
  laboratoryId: string
): Promise<LaboratoryResidueMapping[]> => {
  return kysely
    .selectFrom('laboratoryResidueMappings')
    .selectAll()
    .where('laboratoryId', '=', laboratoryId)
    .orderBy('label')
    .execute();
};

const applyResidueMapping = async (
  laboratoryId: string,
  label: string,
  ssd2Id: SSD2Id
): Promise<void> => {
  const analysisIds = kysely
    .selectFrom('analysis')
    .innerJoin('sampleItems', 'sampleItems.sampleId', 'analysis.sampleId')
    .select('analysis.id')
    .where('sampleItems.laboratoryId', '=', laboratoryId)
    .where('sampleItems.recipientKind', '=', 'Laboratory');

  await kysely
    .updateTable('analysisResidues')
    .set({ reference: ssd2Id, unknownLabel: null })
    .where('unknownLabel', '=', label)
    .where('analysisId', 'in', analysisIds)
    .execute();
};

const update = async ({
  laboratoryId,
  label,
  ssd2Id
}: {
  laboratoryId: string;
  label: string;
  ssd2Id: SSD2Id | null;
}): Promise<LaboratoryResidueMapping> => {
  await kysely
    .insertInto('laboratoryResidueMappings')
    .values({ laboratoryId, label, ssd2Id })
    .onConflict((oc) =>
      oc.columns(['laboratoryId', 'label']).doUpdateSet({ ssd2Id })
    )
    .execute();

  return { laboratoryId, label, ssd2Id };
};

export const laboratoryResidueMappingRepository = {
  findByLaboratoryShortName,
  findByLaboratoryId,
  applyResidueMapping,
  update
};
