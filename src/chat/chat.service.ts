import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from 'src/entities/chat.entity';
import { Message } from 'src/entities/message.entity';
import { Profile } from 'src/entities/profile.entity';
import { Subscription, SubscriptionStatus } from 'src/entities/subscription.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  // Перевірити, чи є метч між користувачами
  private async checkMatch(profile1Id: number, profile2Id: number): Promise<boolean> {
    const match = await this.subscriptionRepository.findOne({
      where: [
        { 
          followerId: profile1Id, 
          followingId: profile2Id,
          status: SubscriptionStatus.MATCHED 
        },
        { 
          followerId: profile2Id, 
          followingId: profile1Id,
          status: SubscriptionStatus.MATCHED 
        },
      ],
    });

    return !!match;
  }

  // Створити чат або отримати існуючий
  async getOrCreateChat(userId: number, otherProfileId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const otherProfile = await this.profileRepository.findOne({
      where: { id: otherProfileId },
    });
    if (!otherProfile) {
      throw new NotFoundException('Profile not found');
    }

    if (userProfile.id === otherProfileId) {
      throw new BadRequestException('Cannot chat with yourself');
    }

    // Перевірити метч
    const hasMatch = await this.checkMatch(userProfile.id, otherProfileId);
    if (!hasMatch) {
      throw new ForbiddenException('You can only chat with matched users');
    }

    // Впорядкувати ID (менший завжди перший)
    const [profile1Id, profile2Id] = 
      userProfile.id < otherProfileId 
        ? [userProfile.id, otherProfileId] 
        : [otherProfileId, userProfile.id];

    // Знайти або створити чат
    let chat = await this.chatRepository.findOne({
      where: { profile1Id, profile2Id },
      relations: ['profile1', 'profile2', 'profile1.user', 'profile2.user'],
    });

    if (!chat) {
      chat = this.chatRepository.create({
        profile1Id,
        profile2Id,
      });
      await this.chatRepository.save(chat);
      
      // Завантажити з relations
      chat = await this.chatRepository.findOne({
        where: { id: chat.id },
        relations: ['profile1', 'profile2', 'profile1.user', 'profile2.user'],
      });
    }

    return chat;
  }

  // Отримати всі чати користувача
  async getUserChats(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.profile1', 'profile1')
      .leftJoinAndSelect('chat.profile2', 'profile2')
      .leftJoinAndSelect('profile1.user', 'user1')
      .leftJoinAndSelect('profile2.user', 'user2')
      .where('chat.profile1Id = :profileId OR chat.profile2Id = :profileId', 
        { profileId: userProfile.id })
      .orderBy('chat.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('chat.createdAt', 'DESC')
      .getMany();

    return chats;
  }

  // Отримати повідомлення чату
  async getChatMessages(userId: number, chatId: number, limit = 50, offset = 0) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Перевірити, що користувач є учасником чату
    if (chat.profile1Id !== userProfile.id && chat.profile2Id !== userProfile.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const messages = await this.messageRepository.find({
      where: { chatId },
      relations: ['sender', 'sender.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return messages.reverse(); // Повертаємо в хронологічному порядку
  }

  // Відправити повідомлення
  async sendMessage(userId: number, chatId: number, content: string): Promise<Message | null> {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Перевірити, що користувач є учасником чату
    if (chat.profile1Id !== userProfile.id && chat.profile2Id !== userProfile.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    const message = this.messageRepository.create({
      chatId,
      senderId: userProfile.id,
      content,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Оновити останнє повідомлення в чаті
    chat.lastMessage = content.substring(0, 100);
    chat.lastMessageAt = new Date();
    await this.chatRepository.save(chat);

    // Завантажити з relations
    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'sender.user'],
    });

    return messageWithRelations;
  }

  // Редагувати повідомлення
  async updateMessage(userId: number, messageId: number, content: string) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'sender.user'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userProfile.id) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    message.content = content;
    message.isEdited = true;

    return this.messageRepository.save(message);
  }

  // Видалити повідомлення
  async deleteMessage(userId: number, messageId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userProfile.id) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messageRepository.remove(message);
  }

  // Позначити повідомлення як прочитані
  async markMessagesAsRead(userId: number, chatId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.profile1Id !== userProfile.id && chat.profile2Id !== userProfile.id) {
      throw new ForbiddenException('You are not a participant of this chat');
    }

    // Позначити всі непрочитані повідомлення від іншого користувача
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('chatId = :chatId', { chatId })
      .andWhere('senderId != :senderId', { senderId: userProfile.id })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }

  // Отримати кількість непрочитаних повідомлень
  async getUnreadCount(userId: number, chatId?: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const query = this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.chat', 'chat')
      .where('message.senderId != :senderId', { senderId: userProfile.id })
      .andWhere('message.isRead = :isRead', { isRead: false })
      .andWhere(
        '(chat.profile1Id = :profileId OR chat.profile2Id = :profileId)',
        { profileId: userProfile.id }
      );

    if (chatId) {
      query.andWhere('message.chatId = :chatId', { chatId });
    }

    return query.getCount();
  }
}
