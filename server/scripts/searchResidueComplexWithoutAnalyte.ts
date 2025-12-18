import { SSD2Hierarchy } from 'maestro-shared/referential/Residue/SSD2Hierarchy';
import { initKysely, kysely } from '../repositories/kysely';
import config from '../utils/config';

const searchResidueComplexWithoutAnalyte = async () => {
  initKysely(config.databaseUrl);

  const complexeIds = Object.keys(SSD2Hierarchy);

  const result = await kysely
    .selectFrom('analysis')
    .leftJoin('analysisResidues', (join) =>
      join
        .onRef('analysis.id', '=', 'analysisResidues.analysisId')
        .on('analysisResidues.resultKind', 'in', ['NQ', 'Q'])
    )

    .where('analysisResidues.resultKind', 'in', ['NQ', 'Q'])
    .where('analysisResidues.reference', 'in', complexeIds)
    .select(['analysis.id as analysisId', 'analysis.sampleId', 'residueNumber'])
    .execute();

  for (const residue of result) {
    const analytes = await kysely
      .selectFrom('residueAnalytes')
      .where('residueAnalytes.analysisId', '=', residue.analysisId)
      .where('residueAnalytes.residueNumber', '=', residue.residueNumber)
      .selectAll()
      .execute();

    if (!analytes.length) {
      console.log(
        `https://app.maestro.beta.gouv.fr/prelevements/${residue.sampleId} \n`
      );
    }
  }
};

export default searchResidueComplexWithoutAnalyte()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
