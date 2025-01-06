import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import config from '../utils/config';

const s3Config : S3ClientConfig = {
  ...config.s3.client,
  //forcePathStyle for S3Mock
  forcePathStyle: true
}

export const getS3Client = (): S3Client => new S3Client(s3Config)