import { isNil, omit, omitBy } from 'lodash-es';
import { Document } from 'maestro-shared/schema/Document/Document';
import { FindDocumentOptions } from 'maestro-shared/schema/Document/FindDocumentOptions';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';
import { sampleDocumentsTable } from './sampleRepository';

const documentsTable = 'documents';

export const Documents = () => db<Document>(documentsTable);

const findUnique = async (id: string): Promise<Document | undefined> => {
  console.info('Find document', id);
  return Documents()
    .where({ id })
    .first()
    .then((_) => _ && Document.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindDocumentOptions
): Promise<Document[]> => {
  console.info('Find documents', omitBy(omit(findOptions, 'sampleId'), isNil));
  return Documents()
    .select(`${documentsTable}.*`)
    .where(omitBy(findOptions, isNil))
    .modify((query) => {
      if (findOptions.sampleId) {
        query
          .join(
            sampleDocumentsTable,
            `${documentsTable}.id`,
            `${sampleDocumentsTable}.document_id`
          )
          .where('sample_id', '=', findOptions.sampleId);
      }
    })
    .then((documents) =>
      documents.map((_: Document) => Document.parse(omitBy(_, isNil)))
    );
};

const insert = async (
  document: Document,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Insert document', document.id);
  await trx.insertInto('documents').values(document).execute();
};

const update = async (
  document: Document,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Update document', document.id);
  await trx
    .updateTable('documents')
    .set(document)
    .where('id', '=', document.id)
    .execute();
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete document', id);
  await Documents().where({ id }).delete();
};

export const documentRepository = {
  insert,
  update,
  findMany,
  findUnique,
  deleteOne
};
