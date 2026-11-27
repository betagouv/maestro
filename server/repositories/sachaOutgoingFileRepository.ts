import type { Insertable } from 'kysely';
import type { AnalysisDaiId } from 'maestro-shared/schema/AnalysisDai/AnalysisDai';
import { kysely } from './kysely';
import type {
  KyselyMaestro,
  SachaOutgoingFile,
  SachaOutgoingFileId
} from './kysely.type';

export type SachaOutgoingFileType = SachaOutgoingFile['fileType'];

const insert = async (
  file: Omit<
    Insertable<SachaOutgoingFile>,
    'id' | 'zipName' | 'depositedAt' | 'createdAt'
  >,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  await trx.insertInto('sachaOutgoingFile').values(file).execute();
};

const findUndeposited = async (fileType: SachaOutgoingFileType) =>
  kysely
    .selectFrom('sachaOutgoingFile')
    .innerJoin(
      'laboratories',
      'laboratories.id',
      'sachaOutgoingFile.laboratoryId'
    )
    .select([
      'sachaOutgoingFile.id',
      'sachaOutgoingFile.fileName',
      'sachaOutgoingFile.documentId',
      'laboratories.sachaSigle'
    ])
    .where('sachaOutgoingFile.fileType', '=', fileType)
    .where('sachaOutgoingFile.depositedAt', 'is', null)
    .where('laboratories.sachaSigle', 'is not', null)
    .$narrowType<{ sachaSigle: string }>()
    .orderBy('sachaOutgoingFile.createdAt')
    .execute();

const markDeposited = async (
  ids: SachaOutgoingFileId[],
  zipName: string,
  depositedAt: Date
): Promise<void> => {
  await kysely.transaction().execute(async (trx) => {
    await trx
      .updateTable('sachaOutgoingFile')
      .set({ zipName, depositedAt })
      .where('id', 'in', ids)
      .execute();
    await trx
      .updateTable('analysisDai')
      .set({ state: 'SENT', sentAt: depositedAt })
      .where('state', '=', 'QUEUED')
      .where('id', 'in', (eb) =>
        eb
          .selectFrom('sachaOutgoingFile')
          .select('analysisDaiId')
          .where('id', 'in', ids)
          .where('analysisDaiId', 'is not', null)
          .$narrowType<{ analysisDaiId: AnalysisDaiId }>()
      )
      .execute();
  });
};

export const sachaOutgoingFileRepository = {
  insert,
  findUndeposited,
  markDeposited
};
