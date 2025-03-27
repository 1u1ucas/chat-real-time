import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface ConnectedUser {
  id: string;
  email: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, ConnectedUser>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
    this.broadcastUserList();
  }

  @SubscribeMessage('userConnected')
  handleUserConnected(client: Socket, user: ConnectedUser) {
    this.connectedUsers.set(client.id, user);
    this.broadcastUserList();
  }

  @SubscribeMessage('getUserList')
  handleGetUserList(client: Socket) {
    client.emit('userList', Array.from(this.connectedUsers.values()));
  }

  private broadcastUserList() {
    this.server.emit('userList', Array.from(this.connectedUsers.values()));
  }
} 