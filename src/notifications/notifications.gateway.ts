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

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

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

  // NotificationsService에서 호출
  emitNotification(userId: string, notification: any) {
    this.server.to(userId).emit('new_notification', notification);
  }
}
