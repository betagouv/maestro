import { chunk, groupBy } from 'lodash-es';
import type { SachaContextSigle } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import type { SachaContext } from 'maestro-shared/schema/SachaContext/SachaContext';
import { kysely } from './kysely';
import type { KyselyMaestro } from './kysely.type';

export type ImportedSachaContext = SachaContext & { deprecated: boolean };

const insertChunkSize = 1000;

const findUsable = async (
  sigle?: SachaContextSigle
): Promise<SachaContext[]> => {
  const contexts = await kysely
    .selectFrom('sachaContexts')
    .select(['sigle', 'libelle'])
    .where('deprecated', '=', false)
    .$if(sigle !== undefined, (qb) =>
      qb.where('sigle', '=', sigle as SachaContextSigle)
    )
    .orderBy('sigle')
    .execute();

  if (contexts.length === 0) {
    return [];
  }

  const commemoratifs = await kysely
    .selectFrom('sachaContextCommemoratifs as scc')
    .innerJoin('sachaCommemoratifs as sc', 'sc.sigle', 'scc.commemoratifSigle')
    .select(['scc.contextSigle', 'scc.commemoratifSigle', 'scc.level'])
    .where('scc.deprecated', '=', false)
    .where('sc.deprecated', '=', false)
    .$if(sigle !== undefined, (qb) =>
      qb.where('scc.contextSigle', '=', sigle as SachaContextSigle)
    )
    .orderBy('scc.commemoratifSigle')
    .execute();
  const commemoratifsByContext = groupBy(commemoratifs, 'contextSigle');

  return contexts.map(({ sigle, libelle }) => ({
    sigle,
    libelle,
    commemoratifs: (commemoratifsByContext[sigle] ?? []).map(
      ({ commemoratifSigle, level }) => ({ sigle: commemoratifSigle, level })
    )
  }));
};

const findUsableBySigle = async (
  sigle: SachaContextSigle
): Promise<SachaContext | undefined> => (await findUsable(sigle))[0];

const synchronize = async (
  contexts: ImportedSachaContext[],
  trx: KyselyMaestro
): Promise<void> => {
  const sigles = contexts.map(({ sigle }) => sigle);

  for (const contextsChunk of chunk(contexts, insertChunkSize)) {
    await trx
      .insertInto('sachaContexts')
      .values(
        contextsChunk.map(({ sigle, libelle, deprecated }) => ({
          sigle,
          libelle,
          deprecated
        }))
      )
      .onConflict((oc) =>
        oc.column('sigle').doUpdateSet((eb) => ({
          libelle: eb.ref('excluded.libelle'),
          deprecated: eb.ref('excluded.deprecated')
        }))
      )
      .execute();
  }

  await trx
    .updateTable('sachaContexts')
    .set({ deprecated: true })
    .where('sigle', 'not in', sigles)
    .execute();

  const lines = contexts.flatMap(({ sigle, commemoratifs }) =>
    commemoratifs.map((commemoratif) => ({
      contextSigle: sigle,
      commemoratifSigle: commemoratif.sigle,
      level: commemoratif.level,
      deprecated: false
    }))
  );

  for (const linesChunk of chunk(lines, insertChunkSize)) {
    await trx
      .insertInto('sachaContextCommemoratifs')
      .values(linesChunk)
      .onConflict((oc) =>
        oc.columns(['contextSigle', 'commemoratifSigle']).doUpdateSet((eb) => ({
          level: eb.ref('excluded.level'),
          deprecated: false
        }))
      )
      .execute();
  }

  await trx
    .updateTable('sachaContextCommemoratifs')
    .set({ deprecated: true })
    .where('contextSigle', 'in', sigles)
    .$if(lines.length > 0, (qb) =>
      qb.where((eb) =>
        eb(
          eb.refTuple('contextSigle', 'commemoratifSigle'),
          'not in',
          lines.map(({ contextSigle, commemoratifSigle }) =>
            eb.tuple(contextSigle, commemoratifSigle)
          )
        )
      )
    )
    .execute();
};

export const sachaContextRepository = {
  findUsable,
  findUsableBySigle,
  synchronize
};
