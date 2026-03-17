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
  // socketId → userId: disconnect 시 역방향 조회용
  private socketToUser = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`[Chat] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Chat] disconnected: ${client.id}`);
    // socket 끊김 시 presence 자동 정리 (leave_room 못 받았을 경우 대비)
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      this.userChatPresence.delete(userId);
      this.socketToUser.delete(client.id);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { chatRoomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.chatRoomId);
    if (data.userId) {
      this.userChatPresence.set(data.userId, data.chatRoomId);
      this.socketToUser.set(client.id, data.userId);
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.userChatPresence.delete(userId);
    this.socketToUser.delete(client.id);
  }

  // ── Video Call Invite signaling (routed through chat socket) ──

  @SubscribeMessage('video_call_invite')
  handleVideoInvite(
    @MessageBody() data: { chatRoomId: string; callerName: string; callerId: string; projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to everyone in room EXCEPT the sender
    client.to(data.chatRoomId).emit('video_call_invite', data);
    console.log(`[Chat] video_call_invite from ${data.callerId} in room ${data.chatRoomId}`);
  }

  @SubscribeMessage('video_call_accepted')
  handleVideoAccepted(
    @MessageBody() data: { chatRoomId: string; acceptorName: string; projectId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.chatRoomId).emit('video_call_accepted', data);
  }

  @SubscribeMessage('video_call_declined')
  handleVideoDeclined(
    @MessageBody() data: { chatRoomId: string; declinorName: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(data.chatRoomId).emit('video_call_declined', data);
  }

  isUserInRoom(userId: string, chatRoomId: string): boolean {
    return this.userChatPresence.get(userId) === chatRoomId;
  }

  // ChatService에서 호출
  emitMessage(chatRoomId: string, message: any) {
    this.server.to(chatRoomId).emit('new_message', message);
  }
}
