import { IsOptional, IsString } from 'class-validator';

export class CreateProjectIntakeDto {
  @IsString()
  clientUserId: string;

  @IsString()
  projectName: string;

  @IsString()
  timeInvestment: string;

  @IsString()
  budgetRange: string;

  @IsString()
  projectDescription: string;

  @IsString()
  goals: string;

  @IsString()
  thumbnailUrl: string;

  @IsOptional()
  @IsString()
  mp4Url?: string | null;
}
