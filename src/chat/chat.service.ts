import { Injectable } from '@nestjs/common';

import { CreateRoomDto, SendMessageDto } from './chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateRoom(dto: CreateRoomDto) {
    return this.prisma.chatRoom.upsert({
      where: {
        projectId_applicantId: {
          projectId: dto.projectId,
          applicantId: dto.applicantId,
        },
      },
      update: {},
      create: {
        projectId: dto.projectId,
        applicantId: dto.applicantId,
      },
    });
  }

  async getMessages(chatRoomId: string) {
    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(dto: SendMessageDto) {
    return this.prisma.message.create({
      data: {
        chatRoomId: dto.chatRoomId,
        senderId: dto.senderId,
        content: dto.content,
      },
    });
  }
}
