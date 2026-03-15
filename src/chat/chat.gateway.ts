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

  handleConnection(client: Socket) {
    console.log(`[Chat] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Chat] disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() chatRoomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(chatRoomId);
  }

  // ChatService에서 호출
  emitMessage(chatRoomId: string, message: any) {
    this.server.to(chatRoomId).emit('new_message', message);
  }
}
