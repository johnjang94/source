import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateProjectIntakeDto {
  @IsString()
  projectName: string;

  @IsString()
  projectDescription: string;

  @IsString()
  expectedOutcome: string;

  @IsString()
  budgetAllowance: string;

  @IsString()
  projectDeadline: string;

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
