import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { executeTransaction } from './kysely';

const upsert = async (
  analysisId: string,
  oldResidues: Omit<PartialResidue, 'analysisId'>[],
  newResidues: Omit<PartialResidue, 'analysisId'>[]
) => {
  return executeTransaction(async (trx) => {
    await trx
      .deleteFrom('analysisErrors')
      .where('analysisId', '=', analysisId)
      .execute();
    await trx
      .insertInto('analysisErrors')
      .values({
        analysisId,
        residues: {
          old: oldResidues,
          new: newResidues
        }
      })
      .execute();
  });
};

export const analysisErrorsRepository = {
  upsert
};
