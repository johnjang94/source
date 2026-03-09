import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export enum UploadKind {
  PROFILE_AVATAR = 'profile-avatar',
  PROJECT_THUMBNAIL = 'project-thumbnail',
  PROJECT_MP4 = 'project-mp4',
  COMPANY_LOGO = 'company-logo',
}

export class CreateUploadUrlDto {
  @IsEnum(UploadKind)
  kind: UploadKind;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contentType: string;
}
