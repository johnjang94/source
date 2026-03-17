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
  namespace: '/video',
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // roomId → Map<socketId, userId>
  private rooms = new Map<string, Map<string, string>>();
  // socketId → roomId (for cleanup on disconnect)
  private socketToRoom = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`[Video] connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Video] disconnected: ${client.id}`);
    this.leaveRoom(client);
  }

  private leaveRoom(client: Socket) {
    const roomId = this.socketToRoom.get(client.id);
    if (!roomId) return;

    client.leave(roomId);
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) this.rooms.delete(roomId);
    }
    this.socketToRoom.delete(client.id);

    // Notify remaining peers
    client.to(roomId).emit('user_left', { socketId: client.id });
  }

  @SubscribeMessage('join_video_room')
  handleJoin(
    @MessageBody() data: { roomId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId } = data;
    client.join(roomId);
    this.socketToRoom.set(client.id, roomId);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }
    const room = this.rooms.get(roomId)!;

    // Collect existing peers before adding self
    const existingPeers: string[] = [];
    room.forEach((_, sid) => existingPeers.push(sid));
    room.set(client.id, userId);

    // Tell new joiner about existing peers — they will initiate the offer
    client.emit('room_peers', { peers: existingPeers });

    // Tell existing peers a new user joined
    client.to(roomId).emit('user_joined', { socketId: client.id, userId });
    console.log(`[Video] ${userId} joined room ${roomId}. Peers: ${existingPeers.length}`);
  }

  // New joiner → existing peer
  @SubscribeMessage('webrtc_offer')
  handleOffer(
    @MessageBody() data: { offer: RTCSessionDescriptionInit; targetSocketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.targetSocketId).emit('webrtc_offer', {
      offer: data.offer,
      fromSocketId: client.id,
    });
  }

  // Existing peer → new joiner
  @SubscribeMessage('webrtc_answer')
  handleAnswer(
    @MessageBody() data: { answer: RTCSessionDescriptionInit; targetSocketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.targetSocketId).emit('webrtc_answer', {
      answer: data.answer,
      fromSocketId: client.id,
    });
  }

  // Both sides exchange ICE candidates
  @SubscribeMessage('ice_candidate')
  handleIceCandidate(
    @MessageBody() data: { candidate: RTCIceCandidateInit; targetSocketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.targetSocketId).emit('ice_candidate', {
      candidate: data.candidate,
      fromSocketId: client.id,
    });
  }

  @SubscribeMessage('leave_video_room')
  handleLeave(@ConnectedSocket() client: Socket) {
    this.leaveRoom(client);
  }
}
