import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoomDto {
  @IsString() @IsNotEmpty() projectId: string;
  @IsString() @IsNotEmpty() applicantId: string;
}

export class SendMessageDto {
  @IsString() @IsNotEmpty() chatRoomId: string;
  @IsString() @IsNotEmpty() senderId: string;
  @IsString() @IsNotEmpty() content: string;
}
