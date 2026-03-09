import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProjectIntakeDto {
  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  timeInvestment?: string;

  @IsOptional()
  @IsString()
  projectDescription?: string;

  @IsOptional()
  @IsString()
  goals?: string;

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
