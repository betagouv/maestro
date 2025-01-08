import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';
import { v4 as uuidv4 } from 'uuid';
import { DocumentKind } from '../../../shared/schema/Document/DocumentKind';
import documentRepository from '../../repositories/documentRepository';
import config from '../../utils/config';
import { getS3Client } from '../s3Service';

const client = getS3Client();

const createDocument = async (
  filename: string,
  documentKind: DocumentKind,
  streamingPayload: StreamingBlobPayloadInputTypes,
  userId: string
) => {
  const id = uuidv4();
  const key = `${id}_${filename}`;
  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: streamingPayload
  });
  await client.send(command);

  await documentRepository.insert({
    id,
    filename,
    kind: documentKind,
    createdBy: userId,
    createdAt: new Date()
  });

  return id;
};

const deleteDocument = async (documentId: string) => {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: config.s3.bucket,
    Key: documentId
  });
  await client.send(deleteCommand);

  await documentRepository.deleteOne(documentId);
};

export const documentService = {
  createDocument,
  deleteDocument
};
