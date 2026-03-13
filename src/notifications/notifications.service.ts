import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        project: {
          select: { id: true, projectName: true },
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
}
