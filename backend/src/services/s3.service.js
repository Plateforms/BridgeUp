import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getS3Client } from '../config/s3.js';
import { getEnv } from '../config/env.js';
import logger from '../config/logger.js';

export async function uploadFile(key, buffer, mimetype) {
  const client = getS3Client();
  const env = getEnv();
  const upload = new Upload({
    client,
    params: { Bucket: env.S3_BUCKET, Key: key, Body: buffer, ContentType: mimetype },
  });
  const result = await upload.done();
  logger.info('File uploaded to S3', { key, bucket: env.S3_BUCKET });
  return { key, location: result.Location || `${env.S3_ENDPOINT}/${env.S3_BUCKET}/${key}` };
}

export async function deleteFile(key) {
  const client = getS3Client();
  const env = getEnv();
  await client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  logger.info('File deleted from S3', { key });
}
