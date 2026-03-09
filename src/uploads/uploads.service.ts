import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { R2Service } from '../r2/r2.service';
import { CreateUploadUrlDto, UploadKind } from './dto/create-upload-url.dto';

type UploadRule = {
  allowedMimeTypes: string[];
  maxBytes: number;
  folder: string;
};

@Injectable()
export class UploadsService {
  constructor(private readonly r2Service: R2Service) {}

  private getRules(kind: UploadKind): UploadRule {
    switch (kind) {
      case UploadKind.PROFILE_AVATAR:
        return {
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maxBytes: 5 * 1024 * 1024,
          folder: 'profiles/avatars',
        };

      case UploadKind.PROJECT_THUMBNAIL:
        return {
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maxBytes: 10 * 1024 * 1024,
          folder: 'projects/thumbnails',
        };

      case UploadKind.PROJECT_MP4:
        return {
          allowedMimeTypes: ['video/mp4'],
          maxBytes: 300 * 1024 * 1024,
          folder: 'projects/videos',
        };

      case UploadKind.COMPANY_LOGO:
        return {
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          maxBytes: 5 * 1024 * 1024,
          folder: 'profiles/logos',
        };

      default:
        throw new BadRequestException('Unsupported upload kind.');
    }
  }

  private sanitizeFilename(filename: string) {
    const lastDotIndex = filename.lastIndexOf('.');
    const ext =
      lastDotIndex >= 0 ? filename.slice(lastDotIndex).toLowerCase() : '';

    return ext.replace(/[^a-z0-9.]/g, '');
  }

  private buildObjectKey(kind: UploadKind, filename: string) {
    const rules = this.getRules(kind);
    const ext = this.sanitizeFilename(filename);
    const safeExt = ext || '';
    const unique = randomUUID();

    return `${rules.folder}/${unique}${safeExt}`;
  }

  async createUploadUrl(dto: CreateUploadUrlDto) {
    const rules = this.getRules(dto.kind);

    if (!rules.allowedMimeTypes.includes(dto.contentType)) {
      throw new BadRequestException(
        `Invalid content type for ${dto.kind}: ${dto.contentType}`,
      );
    }

    const key = this.buildObjectKey(dto.kind, dto.filename);
    const bucket = this.r2Service.getBucketName();
    const publicBaseUrl = this.r2Service.getPublicBaseUrl();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.r2Service.getClient(), command, {
      expiresIn: 60 * 5,
    });

    const fileUrl = `${publicBaseUrl}/${key}`;

    return {
      uploadUrl,
      fileUrl,
      key,
      maxBytes: rules.maxBytes,
      allowedMimeTypes: rules.allowedMimeTypes,
    };
  }
}
