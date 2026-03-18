import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto, SendMessageDto, UpdateMessageMetadataDto } from './chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('room')
  getOrCreateRoom(@Body() dto: CreateRoomDto) {
    return this.chatService.getOrCreateRoom(dto);
  }

  @Get('messages')
  getMessages(@Query('chatRoomId') chatRoomId: string) {
    return this.chatService.getMessages(chatRoomId);
  }

  @Get('debug')
  debug() {
    return this.chatService.debug();
  }

  @Post('messages')
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto);
  }

  @Patch('messages/:id')
  updateMessageMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateMessageMetadataDto,
  ) {
    return this.chatService.updateMessageMetadata(id, dto.metadata);
  }
}
