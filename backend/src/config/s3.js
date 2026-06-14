import { S3Client } from '@aws-sdk/client-s3';
import { getEnv } from './env.js';

let _s3;
export function getS3Client() {
  if (!_s3) {
    const env = getEnv();
    _s3 = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT || undefined,
      forcePathStyle: !!env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
    });
  }
  return _s3;
}
