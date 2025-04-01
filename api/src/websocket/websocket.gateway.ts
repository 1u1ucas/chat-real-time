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
  isOnline: boolean;
  socketId: string;
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
    const user = this.connectedUsers.get(client.id);
    if (user) {
      // Supprimer l'utilisateur de la liste des connectés
      this.connectedUsers.delete(client.id);
      // Vérifier s'il y a d'autres connexions pour cet email
      const hasOtherConnections = Array.from(this.connectedUsers.values()).some(
        u => u.email === user.email
      );
      
      // Si c'est la dernière connexion pour cet email, notifier les autres clients
      if (!hasOtherConnections) {
        this.server.emit('userDisconnected', user.email);
        this.broadcastUserList();
      }
    }
  }

  @SubscribeMessage('userConnected')
  handleUserConnected(client: Socket, user: Omit<ConnectedUser, 'isOnline' | 'socketId'>) {
    // Supprimer l'ancienne connexion si elle existe pour cet email
    for (const [socketId, existingUser] of this.connectedUsers.entries()) {
      if (existingUser.email === user.email) {
        this.connectedUsers.delete(socketId);
        break;
      }
    }

    // Ajouter la nouvelle connexion
    this.connectedUsers.set(client.id, {
      ...user,
      isOnline: true,
      socketId: client.id
    });
    
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