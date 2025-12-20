import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Отримати або створити чат з користувачем
  @Get('with/:profileId')
  getOrCreateChat(
    @CurrentUser('id') userId: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ) {
    return this.chatService.getOrCreateChat(userId, profileId);
  }

  // Отримати всі мої чати
  @Get()
  getUserChats(@CurrentUser('id') userId: number) {
    return this.chatService.getUserChats(userId);
  }

  // Отримати повідомлення чату
  @Get(':chatId/messages')
  getChatMessages(
    @CurrentUser('id') userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.chatService.getChatMessages(
      userId,
      chatId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  // ТЕСТОВИЙ ENDPOINT: Відправити повідомлення через REST
  @Post(':chatId/messages')
  sendMessageRest(
    @CurrentUser('id') userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() body: { content: string },
  ) {
    return this.chatService.sendMessage(userId, chatId, body.content);
  }

  // Отримати кількість непрочитаних повідомлень
  @Get('unread/count')
  getUnreadCount(@CurrentUser('id') userId: number) {
    return this.chatService.getUnreadCount(userId);
  }

  // Отримати кількість непрочитаних повідомлень в конкретному чаті
  @Get(':chatId/unread/count')
  getChatUnreadCount(
    @CurrentUser('id') userId: number,
    @Param('chatId', ParseIntPipe) chatId: number,
  ) {
    return this.chatService.getUnreadCount(userId, chatId);
  }
}

