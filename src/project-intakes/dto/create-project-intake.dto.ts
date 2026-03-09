import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateProjectIntakeDto {
  @IsString()
  projectName: string;

  @IsString()
  budgetRange: string;

  @IsString()
  timeInvestment: string;

  @IsString()
  projectDescription: string;

  @IsString()
  goals: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  mp4Url?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'submitted', 'reviewing', 'approved', 'rejected'])
  status?: string;
}
