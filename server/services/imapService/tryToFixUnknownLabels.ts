import { isNil } from 'lodash-es';
import { SSD2Id } from 'maestro-shared/referential/Residue/SSD2Id';
import { kysely } from '../../repositories/kysely';
import { laboratoriesConf } from './index';

export const tryToFixResiduesWithUnknownLabel = async () => {
  const result = await kysely
    .selectFrom('analysisResidues')
    .select('unknownLabel')
    .where('unknownLabel', 'is not', null)
    .distinct()
    .execute();

  const unknownLabels = result
    .map((r) => r.unknownLabel)
    .filter((l) => !isNil(l));

  const allReferences = Object.values(laboratoriesConf).reduce(
    (acc, conf) => {
      acc = { ...acc, ...conf.ssd2IdByLabel };
      return acc;
    },
    {} as Record<string, SSD2Id>
  );

  for (const unknownLabel of unknownLabels) {
    const ref = allReferences[unknownLabel];

    if (ref) {
      console.log(
        `Attribution de la référence ${ref} au label ${unknownLabel}`
      );
      await kysely
        .updateTable('analysisResidues')
        .where('unknownLabel', '=', unknownLabel)
        .set('reference', ref)
        .set('unknownLabel', null)
        .execute();
    }
  }
};
