import fp from 'lodash';
import { Document } from '../../shared/schema/Document/Document';
import { FindDocumentOptions } from '../../shared/schema/Document/FindDocumentOptions';
import { knexInstance as db } from './db';

const documentsTable = 'documents';

export const Documents = () => db<Document>(documentsTable);

const findUnique = async (id: string): Promise<Document | undefined> => {
  console.info('Find document', id);
  return Documents()
    .where({ id })
    .first()
    .then((_) => _ && Document.parse(fp.omitBy(_, fp.isNil)));
};

const findMany = async (
  findOptions: FindDocumentOptions
): Promise<Document[]> => {
  console.info('Find documents', fp.omitBy(findOptions, fp.isNil));
  return Documents()
    .where(fp.omitBy(findOptions, fp.isNil))
    .then((documents) =>
      documents.map((_) => Document.parse(fp.omitBy(_, fp.isNil)))
    );
};

const insert = async (document: Document): Promise<void> => {
  console.info('Insert document', document.id);
  await Documents().insert(document);
};

const deleteOne = async (id: string): Promise<void> => {
  console.info('Delete document', id);
  await Documents().where({ id }).delete();
};

export default {
  insert,
  findMany,
  findUnique,
  deleteOne
};
