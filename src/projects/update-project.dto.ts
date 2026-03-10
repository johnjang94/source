import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
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
  thumbnailUrl?: string | null;
}
