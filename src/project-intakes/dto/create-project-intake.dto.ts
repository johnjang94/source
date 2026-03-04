import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateProjectIntakeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  clientUserId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  projectName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  timeInvestment!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  budgetRange!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  projectDescription!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  goals!: string;
}
