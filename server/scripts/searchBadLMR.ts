import { sql } from 'kysely';
import { SSD2Referential } from 'maestro-shared/referential/Residue/SSD2Referential';
import { formatWithTz } from 'maestro-shared/utils/date';
import { initKysely, kysely } from '../repositories/kysely';
import { matrixRepository } from '../repositories/matrixRepository';
import config from '../utils/config';

const searchBadLMR = async () => {
  initKysely(config.databaseUrl);

  const { matrices } = await matrixRepository.findReferential();

  for (const { code: matrix, label } of matrices.filter(
    ({ deprecated }) => !deprecated
  )) {
    const samples = await kysely
      .selectFrom('analysisResidues')
      .leftJoin('analysis', 'analysis.id', 'analysisResidues.analysisId')
      .leftJoin('samples', 'analysis.sampleId', 'samples.id')
      .leftJoin('laboratories', 'samples.laboratoryId', 'laboratories.id')
      .select([
        'analysisResidues.reference',
        'analysisResidues.lmr',
        'analysis.sampleId',
        'analysis.createdAt',
        'laboratories.name'
      ])
      .where('analysisResidues.reference', 'not in', [
        'RF-0225-001-PPP',
        'RF-00004675-PAR'
      ])
      .where(
        sql<boolean>`samples.matrices @> ${JSON.stringify([{ matrix }])}::jsonb`
      )
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
            ` - ${label} (${matrix}) - ${SSD2Referential[ref].name} (${ref})`
          );

          byReference[ref]
            .filter((s) => !!s.lmr)
            .forEach((s) => {
              console.log(
                `    - https://app.maestro.beta.gouv.fr/prelevements/${s.sampleId} | ${s.lmr} | ${formatWithTz(s.createdAt ?? new Date(), 'dd/MM/yyyy HH:mm')} | ${s.name}`
              );
            });
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
