import { Transaction } from 'kysely';
import { DocumentKind } from 'maestro-shared/schema/Document/DocumentKind';
import { documentRepository } from '../repositories/documentRepository';
import { executeTransaction } from '../repositories/kysely';
import { DB } from '../repositories/kysely.type';
import { ExtractError } from './imapService';
import { s3Service } from './s3Service';

const insertDocument = async (
  file: File,
  documentKind: DocumentKind,
  userId: string | null,
) => {
  await createDocument(file, documentKind, userId, () => Promise.resolve())
};

const getDocument = async (documentId: string) => {
  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    return;
  }

  const file = await s3Service.downloadDocument(documentId, document.filename);

  return { ...document, file };
};

const createDocument = async <T>(
  file: File,
  documentKind: DocumentKind,
  userId: string | null,
  callback: (documentId: string, trx: Transaction<DB>) => Promise<T>
) => {
  const { documentId, valid, error } = await s3Service.uploadDocument(file);

  if (!valid) {
    throw new ExtractError(
      `Impossible d'uploader le PDF sur le S3: HTTP ${error}`
    );
  }
  try {
    return await executeTransaction(async (trx) => {
      await documentRepository.insert(
        {
          id: documentId,
          filename: file.name,
          kind: documentKind,
          createdBy: userId,
          createdAt: new Date()
        },
        trx
      );

      return callback(documentId, trx);
    });
  } catch (e) {
    await s3Service.deleteDocument(documentId, file.name);
    throw e;
  }
};

const deleteDocument = async (documentId: string) => {
  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    return;
  }

  await s3Service.deleteDocument(documentId, document.filename);

  await documentRepository.deleteOne(documentId);
};

export const documentService = {
  insertDocument,
  createDocument,
  deleteDocument,
  getDocument
};
