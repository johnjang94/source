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
    const room = await this.prisma.chatRoom.upsert({
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
      include: {
        project: {
          select: {
            clientUserId: true,
            projectName: true,
          },
        },
      },
    });

    const memberIds = [
      dto.applicantId,
      room.project.clientUserId,
    ].filter(Boolean);

    const users = await this.prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, firstName: true, lastName: true, avatarUrl: true },
    });

    const members: Record<string, { firstName: string | null; lastName: string | null; avatarUrl: string | null }> = {};
    for (const u of users) {
      members[u.id] = { firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl };
    }

    return {
      id: room.id,
      projectId: room.projectId,
      applicantId: room.applicantId,
      projectName: room.project.projectName,
      members,
    };
  }

  async getMessages(chatRoomId: string) {
    return this.prisma.message.findMany({
      where: { chatRoomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async debug() {
    const rooms = await this.prisma.chatRoom.findMany();
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true },
    });
    return { rooms, users };
  }

  async updateMessageMetadata(messageId: string, metadata: any) {
    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: { metadata },
    });
    this.chatGateway.emitMessageUpdate(message.chatRoomId, message);
    return message;
  }

  async sendMessage(dto: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: {
        chatRoomId: dto.chatRoomId,
        senderId: dto.senderId,
        content: dto.content,
        type: dto.type ?? 'text',
        metadata: dto.metadata ?? undefined,
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

      // 수신자가 현재 같은 채팅방 안에 있으면 알림 생성 skip (실시간으로 보이니까)
      const recipientInRoom = this.chatGateway.isUserInRoom(recipientId, dto.chatRoomId);
      if (!recipientInRoom) {
        await this.notificationsService.upsertDiscussionNotification({
          recipientId,
          senderId: dto.senderId,
          projectId: chatRoom.project.id,
        });
      }
    }

    return message;
  }
}
