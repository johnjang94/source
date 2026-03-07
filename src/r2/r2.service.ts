import { Injectable } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service {
  private readonly client: S3Client;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 environment variables are missing.');
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  getClient() {
    return this.client;
  }

  getBucketName() {
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('R2_BUCKET_NAME is missing.');
    }
    return bucketName;
  }

  getPublicBaseUrl() {
    const baseUrl = process.env.R2_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error('R2_PUBLIC_BASE_URL is missing.');
    }
    return baseUrl.replace(/\/$/, '');
  }
}
