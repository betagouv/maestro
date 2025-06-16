import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { kysely } from './kysely';

const upsert = async (
  analysisId: string,
  oldResidues: Omit<PartialResidue, 'analysisId'>[],
  newResidues: Omit<PartialResidue, 'analysisId'>[]
) => {
  await kysely
    .deleteFrom('analysisErrors')
    .where('analysisId', '=', analysisId)
    .execute();
  await kysely
    .insertInto('analysisErrors')
    .values({
      analysisId,
      residues: {
        old: oldResidues,
        new: newResidues
      }
    })
    .execute();
};

export const analysisErrorsRepository = {
  upsert
};
