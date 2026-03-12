import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProjectIntakeDto {
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @IsString()
  @IsNotEmpty()
  projectDescription: string;

  @IsString()
  @IsNotEmpty()
  expectedOutcome: string;

  @IsNumber()
  @Min(0)
  estimatedBudget: number;

  @IsDateString()
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
