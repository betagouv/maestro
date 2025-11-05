import { MatrixEffective } from 'maestro-shared/referential/Matrix/Matrix';
import { MatrixLabels } from 'maestro-shared/referential/Matrix/MatrixLabels';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import { initKysely, kysely } from '../repositories/kysely';
import config from '../utils/config';

const searchBadLMR = async () => {
  initKysely(config.databaseUrl);

  for (const matrix of MatrixEffective.options) {
    const samples = await kysely
      .selectFrom('analysisResidues')
      .leftJoin('analysis', 'analysis.id', 'analysisResidues.analysisId')
      .leftJoin('samples', 'analysis.sampleId', 'samples.id')
      .select([
        'samples.matrix',
        'analysisResidues.reference',
        'analysisResidues.lmr',
        'analysis.sampleId'
      ])
      .where('matrix', '=', matrix)
      .execute();

    if (samples.length) {
      const byReference = samples.reduce(
        (acc, s) => {
          if (!s.reference) {
            return acc;
          }

          if (!acc[s.reference]) {
            acc[s.reference] = [];
          }
          acc[s.reference].push(s);

          return acc;
        },
        {} as Record<string, typeof samples>
      );

      Object.keys(byReference).forEach((ref) => {
        const lmrs = [
          ...new Set(byReference[ref].map((s) => s.lmr).filter((s) => !!s))
        ];

        if (lmrs.length > 1) {
          console.log(
            // @ts-expect-error ssd2Id
            ` - ${MatrixLabels[matrix]} (${matrix}) - ${SSD2Referential[ref].name} (${ref})`
          );

          byReference[ref]
            .filter((s) => !!s.lmr)
            .forEach((s) =>
              console.log(
                `    - https://app.maestro.beta.gouv.fr/prelevements/${s.sampleId} ${s.lmr}`
              )
            );
        }
      });
    }
  }
};

export default searchBadLMR()
  .then(() => {
    process.exit();
  })
  .catch((e) => {
    console.error('Erreur', e);
    process.exit(1);
  });
