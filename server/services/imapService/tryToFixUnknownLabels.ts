import { isNil } from 'lodash-es';
import { LaboratoryShortName } from 'maestro-shared/referential/Laboratory';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { kysely } from '../../repositories/kysely';
import { laboratoryResidueMappingRepository } from '../../repositories/laboratoryResidueMappingRepository';
import { laboratoriesConf } from './index';

export const tryToFixResiduesWithUnknownLabel = async () => {
  const result = await kysely
    .selectFrom('analysisResidues')
    .leftJoin('analysis', 'analysis.id', 'analysisResidues.analysisId')
    .leftJoin('sampleItems', 'sampleItems.sampleId', 'analysis.sampleId')
    .leftJoin('laboratories', 'laboratories.id', 'sampleItems.laboratoryId')
    .select([
      'analysisResidues.unknownLabel',
      'laboratories.shortName',
      'sampleItems.sampleId',
      'analysisResidues.analysisId'
    ])
    .where('analysisResidues.unknownLabel', 'is not', null)
    .where('sampleItems.recipientKind', '=', 'Laboratory')
    .distinct()
    .execute();

  const unknownLabels = result.filter(
    (l) => !isNil(l.unknownLabel) && !isNil(l.shortName)
  );

  const mappings: Record<
    LaboratoryShortName,
    Record<string, SSD2Id | null>
  > = await Object.keys(laboratoriesConf).reduce(
    async (a, s) => {
      const shortName = s as LaboratoryShortName;
      const acc = await a;
      const mapping =
        await laboratoryResidueMappingRepository.findByLaboratoryShortName(
          shortName
        );

      acc[shortName] = mapping.reduce(
        (m, k) => {
          m[k.label] = k.ssd2Id;
          return m;
        },
        {} as Record<string, SSD2Id | null>
      );
      return acc;
    },
    Promise.resolve({}) as Promise<
      Record<LaboratoryShortName, Record<string, SSD2Id | null>>
    >
  );
  for (const {
    unknownLabel,
    shortName,
    analysisId,
    sampleId
  } of unknownLabels) {
    if (shortName && mappings[shortName] && unknownLabel) {
      const ref = mappings[shortName][unknownLabel];

      if (ref) {
        console.log(
          `Attribution de la référence ${ref} au label ${unknownLabel}`
        );
        await kysely
          .updateTable('analysisResidues')
          .where('unknownLabel', '=', unknownLabel)
          .where('analysisId', '=', analysisId)
          .set('reference', ref)
          .set('unknownLabel', null)
          .execute();
      }
    } else {
      console.log('sampleId', sampleId, unknownLabel, analysisId, shortName);
    }
  }
};
