import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SignAgreementDto {
  @IsString() @IsNotEmpty() projectId: string;
  @IsString() @IsNotEmpty() agreementType: string;
  @IsString() @IsNotEmpty() signatureData: string;
}
