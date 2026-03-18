import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString() @IsNotEmpty() projectId: string;
  @IsString() @IsNotEmpty() applicantId: string;
}

export class SendMessageDto {
  @IsString() @IsNotEmpty() chatRoomId: string;
  @IsString() @IsNotEmpty() senderId: string;
  @IsString() @IsNotEmpty() content: string;
  @IsString() @IsOptional() type?: string;
  @IsOptional() metadata?: any;
}

export class UpdateMessageMetadataDto {
  @IsOptional() metadata?: any;
}
