import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { R2Service } from './r2.service';

@Injectable()
export class StorageService {
  constructor(private readonly r2: R2Service) {}

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

    await this.r2.getClient().send(
      new DeleteObjectCommand({
        Bucket: this.r2.getBucketName(),
        Key: key,
      }),
    );
  }
}
