import { isNil, omitBy } from 'lodash-es';
import { Document } from 'maestro-shared/schema/Document/Document';
import { FindDocumentOptions } from 'maestro-shared/schema/Document/FindDocumentOptions';
import {knexInstance as db} from './db';
import { KyselyMaestro } from './kysely.type';
import { kysely } from './kysely';

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
  console.info('Find documents', omitBy(findOptions, isNil));
  return Documents()
    .where(omitBy(findOptions, isNil))
    .then((documents) =>
      documents.map((_) => Document.parse(omitBy(_, isNil)))
    );
};

const insert = async (document: Document, trx: KyselyMaestro = kysely): Promise<void> => {
  console.info('Insert document', document.id);
  await trx.insertInto('documents').values(document).execute()
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete document', id);
  await Documents().where({ id }).delete();
};

export const documentRepository =  {
  insert,
  findMany,
  findUnique,
  deleteOne,
};
