import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProjectIntakeDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  projectName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  timeInvestment?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  budgetRange?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  projectDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  goals?: string;
}
