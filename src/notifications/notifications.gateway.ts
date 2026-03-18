import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`[Notifications] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Notifications] disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_user')
  handleJoinUser(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);
  }

  // ── Status ──

  @SubscribeMessage('subscribe_status')
  handleSubscribeStatus(
    @MessageBody() data: { targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`status:${data.targetUserId}`);
  }

  @SubscribeMessage('unsubscribe_status')
  handleUnsubscribeStatus(
    @MessageBody() data: { targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`status:${data.targetUserId}`);
  }

  emitStatusChange(userId: string, status: string) {
    this.server.to(`status:${userId}`).emit('status_changed', { userId, status });
  }

  // ── Video Call Signaling (global — works on any page) ──

  @SubscribeMessage('video_call_invite')
  async handleVideoInvite(
    @MessageBody()
    data: {
      targetUserId: string;
      callerName: string;
      callerId: string;
      chatRoomId: string;
      projectId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Check target user status
    const target = await this.prisma.user.findUnique({
      where: { id: data.targetUserId },
      select: { status: true },
    });

    if (!target || target.status === 'dnd' || target.status === 'offline') {
      client.emit('video_call_rejected', {
        reason:
          target?.status === 'dnd'
            ? 'User is on Do Not Disturb'
            : 'User is offline',
      });
      return;
    }

    // Auto-transition: submitted → under review on first video call
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: data.projectId },
        select: { status: true, clientUserId: true, projectName: true },
      });
      if (project && project.status === 'submitted') {
        await this.projectsService.updateStatusInternal(
          data.projectId,
          'under review',
        );
        const notification = await this.prisma.notification.create({
          data: {
            recipientId: project.clientUserId,
            senderId: data.callerId,
            projectId: data.projectId,
            type: 'status_change',
            title: 'Project Under Review',
            message: `Your project "${project.projectName}" is now under review.`,
          },
          include: {
            project: { select: { id: true, projectName: true } },
          },
        });
        this.server
          .to(project.clientUserId)
          .emit('new_notification', {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            isRead: notification.isRead,
            projectId: notification.projectId,
            projectName: notification.project?.projectName ?? null,
            createdAt: notification.createdAt,
          });
      }
    } catch (err) {
      console.error('[Notifications] status transition error:', err);
    }

    // Forward invite to target user's room
    this.server.to(data.targetUserId).emit('video_call_invite', {
      callerName: data.callerName,
      callerId: data.callerId,
      chatRoomId: data.chatRoomId,
      projectId: data.projectId,
    });
    console.log(
      `[Notifications] video_call_invite from ${data.callerId} to ${data.targetUserId}`,
    );
  }

  @SubscribeMessage('video_call_accepted')
  handleVideoAccepted(
    @MessageBody()
    data: { callerUserId: string; acceptorName: string; projectId: string },
  ) {
    this.server.to(data.callerUserId).emit('video_call_accepted', {
      acceptorName: data.acceptorName,
      projectId: data.projectId,
    });
  }

  @SubscribeMessage('video_call_declined')
  handleVideoDeclined(
    @MessageBody() data: { callerUserId: string; declinorName: string },
  ) {
    this.server.to(data.callerUserId).emit('video_call_declined', {
      declinorName: data.declinorName,
    });
  }

  // ── Notifications (existing) ──

  emitNotification(userId: string, notification: any) {
    this.server.to(userId).emit('new_notification', notification);
  }
}
