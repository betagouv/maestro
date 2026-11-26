import type { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { executeNewTransaction } from './kysely';

const upsert = async (
  analysisId: string,
  oldResidues: Omit<PartialResidue, 'analysisId'>[],
  newResidues: Omit<PartialResidue, 'analysisId'>[]
) => {
  return executeNewTransaction(async (trx) => {
    await trx
      .deleteFrom('analysis_errors')
      .where('analysis_id', '=', analysisId)
      .execute();
    await trx
      .insertInto('analysis_errors')
      .values({
        analysis_id: analysisId,
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
