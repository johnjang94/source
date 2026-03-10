import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProjectIntakeDto {
  @IsOptional()
  @IsString()
  projectName?: string;

  @IsOptional()
  @IsString()
  projectDescription?: string;

  @IsOptional()
  @IsString()
  expectedOutcome?: string;

  @IsOptional()
  @IsString()
  budgetAllowance?: string;

  @IsOptional()
  @IsString()
  projectDeadline?: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @IsIn(['guided', 'self-guided'])
  submissionType?: string;

  @IsOptional()
  @IsString()
  @IsIn(['draft', 'submitted', 'reviewing', 'approved', 'rejected'])
  status?: string;
}
