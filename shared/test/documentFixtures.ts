import randomstring from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentToCreate } from '../schema/Document/Document';
import { DocumentKindList } from '../schema/Document/DocumentKind';
import { oneOf } from './testFixtures';

export const genDocumentToCreate = (): DocumentToCreate => ({
  id: uuidv4(),
  filename: randomstring.generate(),
  kind: oneOf(DocumentKindList),
});

export const genDocument = (userId: string): Document => ({
  id: uuidv4(),
  filename: randomstring.generate(),
  createdAt: new Date(),
  createdBy: userId,
  kind: oneOf(DocumentKindList),
});
