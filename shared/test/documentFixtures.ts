import { fakerFR } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';
import {
  DocumentChecked,
  DocumentToCreateChecked
} from '../schema/Document/Document';
import { DocumentKindList } from '../schema/Document/DocumentKind';
import { oneOf } from './testFixtures';
import { NationalCoordinator } from './userFixtures';

export const genDocumentToCreate = (): DocumentToCreateChecked => ({
  id: uuidv4(),
  filename: fakerFR.string.alphanumeric(32),
  kind: oneOf(DocumentKindList)
});

export const genDocument = (
  data?: Partial<DocumentChecked>
): DocumentChecked => ({
  id: uuidv4(),
  filename: fakerFR.string.alphanumeric(32),
  createdAt: new Date(),
  createdBy: uuidv4(),
  name: fakerFR.string.alphanumeric(32),
  kind: oneOf(DocumentKindList),
  ...data
});

export const Regulation201862DocumentFixture = genDocument({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  filename: 'reg 2018 62- annexe 1 du reg 396 2005',
  name: 'Règlement (UE) 2018/62 de la commission',
  kind: 'OtherResourceDocument',
  createdBy: NationalCoordinator.id
});
