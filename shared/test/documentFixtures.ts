import { fakerFR } from '@faker-js/faker';
import type {
  DocumentChecked,
  DocumentToCreateChecked
} from '../schema/Document/Document';
import { DocumentKindList } from '../schema/Document/DocumentKind';
import { oneOf } from './testFixtures';
import { NationalCoordinator } from './userFixtures';

export const genDocumentToCreate = (): DocumentToCreateChecked => ({
  id: crypto.randomUUID(),
  filename: fakerFR.string.alphanumeric(32),
  kind: oneOf(DocumentKindList)
});

export const genDocument = (
  data?: Partial<DocumentChecked>
): DocumentChecked => ({
  id: crypto.randomUUID(),
  filename: fakerFR.string.alphanumeric(32),
  createdAt: new Date(),
  createdBy: crypto.randomUUID(),
  name: fakerFR.string.alphanumeric(32),
  kind: oneOf(DocumentKindList),
  year: new Date().getFullYear(),
  ...data
});

export const Regulation201862DocumentFixture = genDocument({
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  filename: 'reg 2018 62- annexe 1 du reg 396 2005',
  name: 'Règlement (UE) 2018/62 de la commission',
  kind: 'OtherResourceDocument',
  createdBy: NationalCoordinator.id,
  year: new Date().getFullYear()
});
