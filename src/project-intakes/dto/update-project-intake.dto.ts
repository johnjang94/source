import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
  @IsNumber()
  @Min(0)
  estimatedBudget?: number;

  @IsOptional()
  @IsDateString()
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
