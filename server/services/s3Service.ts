import { DocumentToCreate } from '../../shared/schema/Document/Document';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import config from '../utils/config';
import { v4 as uuidv4 } from 'uuid';

import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
export const getUploadSignedUrlS3 = async (filename: DocumentToCreate['filename']): Promise<{url: string, documentId: string}> => {


  console.log('Get signed url for file', filename);

  const client = new S3({
      ...config.s3.client,
    //FIXME forcePathStyle for S3Mock
    forcePathStyle: true
    }
  );
  const id = uuidv4();
  const key = `${id}_${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });



  return {url, documentId: id}
};
