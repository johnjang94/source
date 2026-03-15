import { Injectable } from '@nestjs/common';
import { CreateRoomDto, SendMessageDto } from './chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly notificationsService: NotificationsService,
  ) {}

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
    const message = await this.prisma.message.create({
      data: {
        chatRoomId: dto.chatRoomId,
        senderId: dto.senderId,
        content: dto.content,
      },
    });

    this.chatGateway.emitMessage(dto.chatRoomId, message);
    const chatRoom = await this.prisma.chatRoom.findUnique({
      where: { id: dto.chatRoomId },
      include: {
        project: {
          select: { clientUserId: true, projectName: true, id: true },
        },
      },
    });

    if (chatRoom) {
      const recipientId =
        dto.senderId === chatRoom.project.clientUserId
          ? chatRoom.applicantId
          : chatRoom.project.clientUserId;

      await this.notificationsService.createAndEmit({
        recipientId,
        senderId: dto.senderId,
        projectId: chatRoom.project.id,
        type: 'discussion',
        title: 'New Message',
        message: `You have a new message regarding ${chatRoom.project.projectName}`,
      });
    }

    return message;
  }
}
