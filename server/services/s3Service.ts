import { DocumentToCreate } from '../../shared/schema/Document/Document';
import { PutObjectCommand, S3, S3ClientConfig } from '@aws-sdk/client-s3';
import config from '../utils/config';
import { v4 as uuidv4 } from 'uuid';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

const getKey = (documentId: string, filename: string): string =>  `${documentId}_${filename}`

const getS3Config = (): S3ClientConfig => ({
  ...config.s3.client,
  //FIXME forcePathStyle for S3Mock
  forcePathStyle: true
})

export const getUploadSignedUrlS3 = async (filename: DocumentToCreate['filename']): Promise<{url: string, documentId: string}> => {

  console.log('Get signed url for file', filename);

  const client = new S3(getS3Config());
  const id = uuidv4();

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: getKey(id, filename),
  });

  const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });

  return {url, documentId: id}
};

export const deleteDocumentS3 = async (documentId: string, filename: string) => {
  const client = new S3(getS3Config());
  const command = new DeleteObjectCommand({
    Bucket: config.s3.bucket,
    Key: getKey(documentId, filename),
  });

  await client.send(command);
}