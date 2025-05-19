import { PartialResidue } from 'maestro-shared/schema/Analysis/Residue/Residue';
import { kysely } from './kysely';

const insert = async (
  analysisId: string,
  oldResidues: Omit<PartialResidue, 'analysisId'>[],
  newResidues: Omit<PartialResidue, 'analysisId'>[]
) => {
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
  insert
};
