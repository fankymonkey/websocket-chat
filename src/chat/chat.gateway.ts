import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {

  @WebSocketServer()
  public server: Server;

  constructor(private readonly chatService: ChatService) {}

  onModuleInit() {

    this.server.on('connection', (socket: Socket) => {

      const {name, token } = socket.handshake.auth;
      if( !name ){
        socket.disconnect()
        return;


      }

      //agregar cliente al listado
      this.chatService.onClientConnected({id: socket.id, name: name});
      //mensaje bienvenida
      socket.emit('welcome-message', 'Bienvenido al servidor')

      //listado clientes conectados
      this.server.emit('on-clients-changed', this.chatService.getClients())


      socket.on('disconnect', () => {
        this.chatService.onClientDisconnected(socket.id)
        this.server.emit('on-clients-changed', this.chatService.getClients())
        
      })
    })
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client:Socket,
  ){
    const {name, token} = client.handshake.auth;

    if(!message) {
      return;
    }
    this.server.emit('on-message', {userId: client.id, message: message, name: name})
  }
}
