import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentToCreate } from '../schema/Document/Document';
import { DocumentKindList } from '../schema/Document/DocumentKind';
import { oneOf } from './testFixtures';
import { fakerFR } from '@faker-js/faker';

export const genDocumentToCreate = (): DocumentToCreate => ({
  id: uuidv4(),
  filename: fakerFR.string.alphanumeric(32),
  kind: oneOf(DocumentKindList)
});

export const genDocument = (data?: Partial<Document>): Document => ({
  id: uuidv4(),
  filename: fakerFR.string.alphanumeric(32),
  createdAt: new Date(),
  createdBy: uuidv4(),
  kind: oneOf(DocumentKindList),
  ...data
});
