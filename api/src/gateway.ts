import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    },
    namespace: '/',
    transports: ['websocket'],
    allowEIO3: true
  })
  export class Gateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
      console.log('WebSocket Gateway initialisé');
    }
  
    handleConnection(client: Socket) {
      console.log(`Client connecté: ${client.id}`);
      // Écouter tous les événements pour le débogage
      client.onAny((event, ...args) => {
        console.log(`Événement reçu de ${client.id}:`, event, args);
      });
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client déconnecté: ${client.id}`);
    }
  
    @SubscribeMessage('newMessage')
    handleMessage(client: Socket, payload: any): void {
      console.log('Message reçu sur le serveur:', payload);
      // Diffuser le message à tous les clients connectés
      this.server.emit('receivedMessage', payload);
      console.log('Message rediffusé à tous les clients');
    }
  }
  