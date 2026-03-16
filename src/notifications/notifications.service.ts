import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        project: {
          select: { id: true, projectName: true },
        },
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      projectId: n.projectId,
      projectName: n.project?.projectName ?? null,
      senderFirstName: n.sender?.firstName ?? null,
      senderLastName: n.sender?.lastName ?? null,
      senderAvatarUrl: n.sender?.avatarUrl ?? null,
      createdAt: n.createdAt,
    }));
  }

  async markRead(userId: string, ids: string[]) {
    await this.prisma.notification.updateMany({
      where: {
        id: { in: ids },
        recipientId: userId,
      },
      data: { isRead: true },
    });

    return { success: true };
  }

  // 다른 서비스에서 알림 생성 시 호출
  async createAndEmit(data: {
    recipientId: string;
    senderId?: string;
    projectId?: string;
    type: string;
    title: string;
    message: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId,
        projectId: data.projectId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
      include: {
        project: { select: { id: true, projectName: true } },
      },
    });

    const payload = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      projectId: notification.projectId,
      projectName: notification.project?.projectName ?? null,
      createdAt: notification.createdAt,
    };

    // 실시간 emit
    this.notificationsGateway.emitNotification(data.recipientId, payload);

    return payload;
  }
}
