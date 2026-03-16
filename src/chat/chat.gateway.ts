import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId → chatRoomId: 현재 어떤 채팅방에 접속 중인지 추적
  private userChatPresence = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`[Chat] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Chat] disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { chatRoomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.chatRoomId);
    if (data.userId) {
      this.userChatPresence.set(data.userId, data.chatRoomId);
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() userId: string) {
    this.userChatPresence.delete(userId);
  }

  isUserInRoom(userId: string, chatRoomId: string): boolean {
    return this.userChatPresence.get(userId) === chatRoomId;
  }

  // ChatService에서 호출
  emitMessage(chatRoomId: string, message: any) {
    this.server.to(chatRoomId).emit('new_message', message);
  }
}
