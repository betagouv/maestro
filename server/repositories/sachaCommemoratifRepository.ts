import type {
  CommemoratifSigle,
  SachaCommemoratif,
  SachaCommemoratifRecord
} from 'maestro-shared/schema/SachaCommemoratif/SachaCommemoratif';
import { executeTransaction, kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';

type ImportedCommemoratif = Omit<SachaCommemoratif, 'values'> & {
  values: SachaCommemoratif['values'][number][];
};

const findAll = async (): Promise<SachaCommemoratifRecord> => {
  const commemoratifs = await kysely
    .selectFrom('sachaCommemoratifs')
    .select(['sigle', 'libelle', 'typeDonnee', 'unite'])
    .where('deprecated', '=', false)
    .execute();

  const values = await kysely
    .selectFrom('sachaCommemoratifValues')
    .select(['sigle', 'commemoratifSigle', 'libelle'])
    .where('deprecated', '=', false)
    .execute();

  return Object.fromEntries(
    commemoratifs.map((c) => [
      c.sigle,
      {
        ...c,
        values: Object.fromEntries(
          values
            .filter((v) => v.commemoratifSigle === c.sigle)
            .map(({ sigle, libelle }) => [sigle, { sigle, libelle }])
        )
      }
    ])
  );
};

const findAllSigles = async (
  trx: KyselyMaestro = kysely
): Promise<CommemoratifSigle[]> =>
  (await trx.selectFrom('sachaCommemoratifs').select('sigle').execute()).map(
    ({ sigle }) => sigle
  );

const upsertAll = async (
  commemoratifs: ImportedCommemoratif[],
  trx: KyselyMaestro = kysely
): Promise<void> => {
  const execute = async (db: KyselyMaestro) => {
    for (const commemoratif of commemoratifs) {
      const { values, ...commemoratifData } = commemoratif;

      await db
        .insertInto('sachaCommemoratifs')
        .values({ ...commemoratifData, deprecated: false })
        .onConflict((oc) =>
          oc.column('sigle').doUpdateSet({
            libelle: commemoratifData.libelle,
            typeDonnee: commemoratifData.typeDonnee,
            unite: commemoratifData.unite,
            deprecated: false
          })
        )
        .execute();

      for (const value of values) {
        await db
          .insertInto('sachaCommemoratifValues')
          .values({
            ...value,
            commemoratifSigle: commemoratif.sigle,
            deprecated: false
          })
          .onConflict((oc) =>
            oc.column('sigle').doUpdateSet({
              libelle: value.libelle,
              commemoratifSigle: commemoratif.sigle,
              deprecated: false
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

const deprecateMissing = async (
  commemoratifs: ImportedCommemoratif[],
  trx: KyselyMaestro = kysely
): Promise<void> => {
  const sigles = commemoratifs.map(({ sigle }) => sigle);

  await trx
    .updateTable('sachaCommemoratifs')
    .set({ deprecated: true })
    .where('sigle', 'not in', sigles)
    .execute();

  for (const { sigle, values } of commemoratifs) {
    await trx
      .updateTable('sachaCommemoratifValues')
      .set({ deprecated: true })
      .where('commemoratifSigle', '=', sigle)
      .$if(values.length > 0, (qb) =>
        qb.where(
          'sigle',
          'not in',
          values.map((value) => value.sigle)
        )
      )
      .execute();
  }
};

export const sachaCommemoratifRepository = {
  findAll,
  findAllSigles,
  upsertAll,
  deprecateMissing
};
