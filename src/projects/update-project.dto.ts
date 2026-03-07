import { IsOptional, IsString } from 'class-validator';

export class UpdateProjectDto {
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
  thumbnailUrl?: string | null;
}
