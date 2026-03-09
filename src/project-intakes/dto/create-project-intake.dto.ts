import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateProjectIntakeDto {
  @IsString()
  @MaxLength(200)
  projectName: string;

  @IsString()
  @MaxLength(200)
  timeInvestment: string;

  @IsString()
  @MaxLength(200)
  budgetRange: string;

  @IsString()
  @MaxLength(5000)
  projectDescription: string;

  @IsString()
  @MaxLength(5000)
  goals: string;

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
