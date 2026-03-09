import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProjectIntakeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  timeInvestment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  budgetRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  projectDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  goals?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(2000)
  thumbnailUrl?: string | null;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(2000)
  mp4Url?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string;
}
