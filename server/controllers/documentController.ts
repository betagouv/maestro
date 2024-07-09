import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { v4 as uuidv4 } from 'uuid';
import DocumentMissingError from '../../shared/errors/documentMissingError';
import {
  Document,
  DocumentToCreate,
} from '../../shared/schema/Document/Document';
import { hasPermission } from '../../shared/schema/User/User';
import documentRepository from '../repositories/documentRepository';
import config from '../utils/config';

const getUploadSignedUrl = async (request: Request, response: Response) => {
  const { filename, kind } = request.body as Omit<DocumentToCreate, 'id'>;
  const user = (request as AuthenticatedRequest).user;

  if (kind === 'Resource' && !hasPermission(user, 'createResource')) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }
  if (kind === 'AnalysisDocument' && !hasPermission(user, 'createAnalysis')) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  console.log('Get signed url for file', filename);

  const client = new S3(config.s3.client);
  const id = uuidv4();
  const key = `${id}_${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });

  response.status(200).json({ url, documentId: id });
};

const getDownloadSignedUrl = async (request: Request, response: Response) => {
  const { documentId } = request.params;

  console.log('Get signed url for download document', documentId);

  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    throw new DocumentMissingError(documentId);
  }

  const client = new S3(config.s3.client);
  const key = `${documentId}_${document.filename}`;

  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });

  response.status(200).json({ url });
};

const createDocument = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const documentToCreate = DocumentToCreate.parse(request.body);

  if (
    documentToCreate.kind === 'Resource' &&
    !hasPermission(user, 'createResource')
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }
  if (
    documentToCreate.kind === 'AnalysisDocument' &&
    !hasPermission(user, 'createAnalysis')
  ) {
    return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
  }

  console.log('Create document', documentToCreate);

  const document: Document = {
    ...documentToCreate,
    createdAt: new Date(),
    createdBy: user.id,
  };

  await documentRepository.insert(document);

  response.status(constants.HTTP_STATUS_CREATED).send(document);
};

const findResources = async (request: Request, response: Response) => {
  console.info('Find documents');

  const documents = await documentRepository.findMany({
    kind: 'Resource',
  });

  response.status(constants.HTTP_STATUS_OK).send(documents);
};

const deleteDocument = async (request: Request, response: Response) => {
  const { documentId } = request.params;

  console.log('Delete document', documentId);

  const document = await documentRepository.findUnique(documentId);

  if (!document) {
    throw new DocumentMissingError(documentId);
  }

  const client = new S3(config.s3.client);
  const key = `${documentId}_${document.filename}`;

  const command = new DeleteObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  await client.send(command);

  await documentRepository.deleteOne(documentId);

  response.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
};

export default {
  getUploadSignedUrl,
  getDownloadSignedUrl,
  createDocument,
  findResources,
  deleteDocument,
};
