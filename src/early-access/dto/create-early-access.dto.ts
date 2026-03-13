import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEarlyAccessDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  portfolio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
