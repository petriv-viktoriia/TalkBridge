import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateMessageDto } from 'src/dtos/messages/create-message.dto';
import { UpdateMessageDto } from 'src/dtos/messages/update-message.dto';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001', // Ваш фронтенд URL
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, string> = new Map(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Отримати токен з різних джерел
      const token = 
        client.handshake.auth.token || 
        client.handshake.headers.authorization?.split(' ')[1] ||
        client.handshake.query.token;
      
      console.log('[WS] Attempting connection, token present:', !!token);
      
      if (!token) {
        console.error('[WS] No token provided');
        client.disconnect();
        return;
      }

      // Верифікувати токен
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      
      // ВИПРАВЛЕННЯ: використовуємо 'sub' замість 'id'
      const userId = payload.sub || payload.id;

      console.log('[WS] Token payload:', { userId, sub: payload.sub, id: payload.id, email: payload.email });

      if (!userId) {
        console.error('[WS] No userId in token payload');
        client.disconnect();
        return;
      }

      // Зберегти зв'язок userId -> socketId
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      console.log(`[WS] User ${userId} connected with socket ${client.id}`);
      console.log('[WS] Client data after connection:', client.data);
      
      // Відправити підтвердження підключення
      client.emit('connected', { userId });
    } catch (error) {
      console.error('[WS] Connection error:', error.message);
      client.emit('error', { message: 'Authentication failed: ' + error.message });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  // Приєднатися до чату
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number },
  ) {
    try {
      const userId = client.data.userId;
      
      if (!userId) {
        console.error('[WS] No userId in client data for joinChat');
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { chatId } = data;

      console.log(`[WS] User ${userId} joining chat ${chatId}`);

      // Приєднатися до кімнати чату (БЕЗ перевірки доступу)
      client.join(`chat_${chatId}`);
      
      console.log(`[WS] User ${userId} joined room chat_${chatId}`);
      
      // Позначити повідомлення як прочитані
      try {
        await this.chatService.markMessagesAsRead(userId, chatId);
      } catch (error) {
        console.error('[WS] Error marking messages as read:', error.message);
        // Не блокуємо приєднання до чату через помилку читання
      }

      client.emit('joinedChat', { chatId });
    } catch (error) {
      console.error('[WS] Join chat error:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  // Вийти з чату
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number },
  ) {
    const { chatId } = data;
    client.leave(`chat_${chatId}`);
    client.emit('leftChat', { chatId });
  }

  // Відправити повідомлення
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number; content: string },
  ) {
    try {
      console.log('[WS] sendMessage called, client.data:', client.data);
      
      const userId = client.data.userId;
      
      if (!userId) {
        console.error('[WS] No userId in client data');
        client.emit('error', { message: 'Not authenticated' });
        return { success: false, error: 'Not authenticated' };
      }

      const { chatId, content } = data;

      console.log(`[WS] User ${userId} sending message to chat ${chatId}:`, content);

      const message = await this.chatService.sendMessage(userId, chatId, content);

      if (!message) {
        console.error('[WS] Failed to save message');
        client.emit('error', { message: 'Failed to save message' });
        return { success: false, error: 'Failed to save message' };
      }

      console.log('[WS] Message saved:', message.id);

      // ВИПРАВЛЕННЯ: this.server вже є namespace '/chat'
      const io = this.server as any;
      const rooms = io.adapter?.rooms || new Map();
      const room = rooms.get(`chat_${chatId}`);
      console.log(`[WS] Clients in room chat_${chatId}:`, room ? Array.from(room) : 'none');

      // Відправити повідомлення всім учасникам чату
      this.server.to(`chat_${chatId}`).emit('newMessage', message);

      console.log(`[WS] Message broadcasted to room chat_${chatId}`);

      // Також відправити відправнику для підтвердження
      client.emit('messageSent', { success: true, message });

      return { success: true, message };
    } catch (error) {
      console.error('[WS] Send message error:', error.message);
      console.error('[WS] Full error:', error);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // Редагувати повідомлення
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number; content: string },
  ) {
    try {
      const userId = client.data.userId;
      const { messageId, content } = data;

      const message = await this.chatService.updateMessage(userId, messageId, content);

      // Відправити оновлення всім учасникам чату
      this.server.to(`chat_${message.chatId}`).emit('messageEdited', message);

      return { success: true, message };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // Видалити повідомлення
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: number; chatId: number },
  ) {
    try {
      const userId = client.data.userId;
      const { messageId, chatId } = data;

      await this.chatService.deleteMessage(userId, messageId);

      // Повідомити всім учасникам чату
      this.server.to(`chat_${chatId}`).emit('messageDeleted', { messageId });

      return { success: true };
    } catch (error) {
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  // Користувач друкує
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number },
  ) {
    const userId = client.data.userId;
    const { chatId } = data;

    // Відправити іншим учасникам чату (крім себе)
    client.to(`chat_${chatId}`).emit('userTyping', { userId, chatId });
  }

  // Користувач перестав друкувати
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: number },
  ) {
    const userId = client.data.userId;
    const { chatId } = data;

    client.to(`chat_${chatId}`).emit('userStoppedTyping', { userId, chatId });
  }
}
