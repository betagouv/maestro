import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig
} from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { DocumentToCreate } from 'maestro-shared/schema/Document/Document';
import { v4 as uuidv4 } from 'uuid';
import config from '../utils/config';

const getKey = (documentId: string, filename: string): string =>
  `${documentId}_${filename}`;

const s3Config: S3ClientConfig = {
  ...config.s3.client,
  //forcePathStyle for S3Mock
  forcePathStyle: true
};

const getS3Client = (): S3Client => new S3Client(s3Config);
const getUploadSignedUrlS3 = async (
  filename: DocumentToCreate['filename']
): Promise<{ url: string; documentId: string }> => {
  console.log('Get signed url for file', filename);

  const client = getS3Client();
  const id = uuidv4();

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: getKey(id, filename)
  });

  const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });

  return { url, documentId: id };
};

const deleteDocument = async (documentId: string, filename: string) => {
  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: config.s3.bucket,
    Key: getKey(documentId, filename)
  });

  await client.send(command);
};

const uploadDocument = async (
  file: File
): Promise<
  | { valid: true; documentId: string; error?: never }
  | { valid: false; error: string; documentId?: never }
> => {
  const { url, documentId } = await getUploadSignedUrlS3(file.name);

  const uploadResult = await fetch(url, {
    method: 'PUT',
    body: file
  });

  if (uploadResult.ok) {
    return { valid: true, documentId };
  }

  return { valid: false, error: uploadResult.statusText };
};

export const s3Service = {
  uploadDocument,
  deleteDocument,
  getClient: getS3Client,
  getUploadSignedUrl: getUploadSignedUrlS3
};
