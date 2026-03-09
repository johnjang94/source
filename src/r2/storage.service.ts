import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });

  private readonly bucket = process.env.R2_BUCKET || '';

  extractKeyFromUrl(url?: string | null) {
    if (!url) return null;

    try {
      const parsed = new URL(url);
      const key = parsed.pathname.replace(/^\/+/, '');
      return key || null;
    } catch {
      return null;
    }
  }

  async deleteByUrl(url?: string | null) {
    const key = this.extractKeyFromUrl(url);
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
