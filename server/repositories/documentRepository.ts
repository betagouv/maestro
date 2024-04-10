import { Document } from '../../shared/schema/Document/Document';
import db from './db';

const documentsTable = 'documents';

export const Documents = () => db<Document>(documentsTable);

const findUnique = async (id: string): Promise<Document | undefined> => {
  console.info('Find document', id);
  return Documents().where({ id }).first();
};

const findMany = async (): Promise<Document[]> => {
  console.info('Find documents');
  return Documents();
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
  deleteOne,
};
