import {
  SachaCommemoratif,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { executeTransaction, kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';

const findAll = async (): Promise<SachaCommemoratifRecord> => {
  const commemoratifs = await kysely
    .selectFrom('sachaCommemoratifs')
    .selectAll()
    .execute();

  const values = await kysely
    .selectFrom('sachaCommemoratifValues')
    .selectAll()
    .execute();

  return Object.fromEntries(
    commemoratifs.map((c) => [
      c.sigle,
      {
        ...c,
        values: Object.fromEntries(
          values
            .filter((v) => v.commemoratifSigle === c.sigle)
            .map((v) => [v.sigle, v])
        )
      }
    ])
  );
};

const upsertAll = async (
  commemoratifs: SachaCommemoratif[],
  trx: KyselyMaestro = kysely
): Promise<void> => {
  const execute = async (db: KyselyMaestro) => {
    for (const commemoratif of commemoratifs) {
      const { values, ...commemoratifData } = commemoratif;

      await db
        .insertInto('sachaCommemoratifs')
        .values(commemoratifData)
        .onConflict((oc) =>
          oc.column('sigle').doUpdateSet({
            libelle: commemoratifData.libelle,
            typeDonnee: commemoratifData.typeDonnee,
            unite: commemoratifData.unite
          })
        )
        .execute();

      for (const value of values) {
        await db
          .insertInto('sachaCommemoratifValues')
          .values({
            ...value,
            commemoratifSigle: commemoratif.sigle
          })
          .onConflict((oc) =>
            oc.column('sigle').doUpdateSet({
              libelle: value.libelle,
              commemoratifSigle: commemoratif.sigle
            })
          )
          .execute();
      }
    }
  };

  if (trx === kysely) {
    await executeTransaction(execute);
  } else {
    await execute(trx);
  }
};

export const sachaCommemoratifRepository = {
  findAll,
  upsertAll
};
