import { SachaCommemoratif } from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { executeTransaction, kysely } from './kysely';

const findAll = async (): Promise<SachaCommemoratif[]> => {
  const commemoratifs = await kysely
    .selectFrom('sachaCommemoratifs')
    .selectAll()
    .execute();

  const values = await kysely
    .selectFrom('sachaCommemoratifValues')
    .selectAll()
    .execute();

  return commemoratifs.map((c) => ({
    ...c,
    values: values.filter((v) => v.commemoratifSigle === c.sigle)
  }));
};

const upsertAll = async (commemoratifs: SachaCommemoratif[]): Promise<void> => {
  await executeTransaction(async (trx) => {
    for (const commemoratif of commemoratifs) {
      const { values, ...commemoratifData } = commemoratif;

      await trx
        .insertInto('sachaCommemoratifs')
        .values(commemoratifData)
        .onConflict((oc) =>
          oc.column('sigle').doUpdateSet({
            cle: commemoratifData.cle,
            libelle: commemoratifData.libelle,
            statut: commemoratifData.statut,
            typeDonnee: commemoratifData.typeDonnee,
            unite: commemoratifData.unite
          })
        )
        .execute();

      for (const value of values) {
        await trx
          .insertInto('sachaCommemoratifValues')
          .values({
            ...value,
            commemoratifSigle: commemoratif.sigle
          })
          .onConflict((oc) =>
            oc.column('sigle').doUpdateSet({
              cle: value.cle,
              libelle: value.libelle,
              statut: value.statut,
              commemoratifSigle: commemoratif.sigle
            })
          )
          .execute();
      }
    }
  });
};

export const sachaCommemoratifRepository = {
  findAll,
  upsertAll
};
