import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectBriefDto {
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
  targetAudience?: string;

  @IsOptional()
  @IsString()
  projectStage?: string;

  @IsOptional()
  @IsString()
  aiInvolvement?: string;

  @IsOptional()
  @IsString()
  currentFrustrations?: string;

  @IsOptional()
  @IsString()
  triedSolutions?: string;

  @IsOptional()
  @IsString()
  desiredFeatures?: string;

  @IsOptional()
  @IsString()
  successMetrics?: string;

  @IsOptional()
  @IsString()
  kpis?: string;

  @IsOptional()
  @IsString()
  technicalConstraints?: string;

  @IsOptional()
  @IsString()
  stakeholders?: string;

  @IsOptional()
  @IsString()
  dependencies?: string;

  @IsOptional()
  @IsString()
  regulatoryRequirements?: string;
}
