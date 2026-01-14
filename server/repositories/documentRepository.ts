import { isNil, omit, omitBy } from 'lodash-es';
import { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { FindDocumentOptions } from 'maestro-shared/schema/Document/FindDocumentOptions';
import { knexInstance as db } from './db';
import { kysely } from './kysely';
import { KyselyMaestro } from './kysely.type';
import { sampleDocumentsTable } from './sampleRepository';

const documentsTable = 'documents';

export const Documents = () => db<DocumentChecked>(documentsTable);

const findUnique = async (id: string): Promise<DocumentChecked | undefined> => {
  console.info('Find document', id);
  return Documents()
    .where({ id })
    .first()
    .then((_) => _ && DocumentChecked.parse(omitBy(_, isNil)));
};

const findMany = async (
  findOptions: FindDocumentOptions
): Promise<DocumentChecked[]> => {
  console.info('Find documents', omitBy(omit(findOptions, 'sampleId'), isNil));
  return Documents()
    .select(`${documentsTable}.*`)
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
      if (findOptions.kinds) {
        query.whereIn('kind', findOptions.kinds);
      }
    })
    .then((documents) =>
      documents.map((_: DocumentChecked) =>
        DocumentChecked.parse(omitBy(_, isNil))
      )
    );
};

const insert = async (
  document: DocumentChecked,
  trx: KyselyMaestro = kysely
): Promise<void> => {
  console.info('Insert document', document.id);
  await trx.insertInto('documents').values(document).execute();
};

const update = async (
  document: DocumentChecked,
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
