import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/entities/comment.entity';
import { Profile } from 'src/entities/profile.entity';
import { Subscription, SubscriptionStatus } from 'src/entities/subscription.entity';
import { CreateCommentDto } from 'src/dtos/comments/create-comment.dto';
import { UpdateCommentDto } from 'src/dtos/comments/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  private async checkSubscriptionHistory(authorProfileId: number, targetProfileId: number): Promise<boolean> {
    const currentMatch = await this.subscriptionRepository.findOne({
      where: [
        { 
          followerId: authorProfileId, 
          followingId: targetProfileId,
          status: SubscriptionStatus.MATCHED 
        },
        { 
          followerId: targetProfileId, 
          followingId: authorProfileId,
          status: SubscriptionStatus.MATCHED 
        },
      ],
    });

    if (currentMatch) return true;

    const subscriptions = await this.subscriptionRepository.find({
      where: [
        { followerId: authorProfileId, followingId: targetProfileId },
        { followerId: targetProfileId, followingId: authorProfileId },
      ],
    });

    const hasFollowed = subscriptions.some(s => s.followerId === authorProfileId);
    const wasFollowed = subscriptions.some(s => s.followingId === authorProfileId);

    return hasFollowed && wasFollowed;
  }

  async createComment(authorUserId: number, profileId: number, dto: CreateCommentDto) {
    const authorProfile = await this.profileRepository.findOne({
      where: { user: { id: authorUserId } },
    });
    if (!authorProfile) {
      throw new NotFoundException('Your profile not found');
    }

    if (authorProfile.id === profileId) {
      throw new BadRequestException('Cannot comment on your own profile');
    }

    const targetProfile = await this.profileRepository.findOne({
      where: { id: profileId },
    });
    if (!targetProfile) {
      throw new NotFoundException('Profile not found');
    }

    const hasSubscriptionHistory = await this.checkSubscriptionHistory(
      authorProfile.id,
      profileId
    );

    if (!hasSubscriptionHistory) {
      throw new ForbiddenException(
        'You can only comment on profiles you have been matched with'
      );
    }

    const comment = this.commentRepository.create({
      authorId: authorProfile.id,
      profileId: profileId,
      content: dto.content,
    });

    return this.commentRepository.save(comment);
  }

  async updateComment(authorUserId: number, commentId: number, dto: UpdateCommentDto) {
    const authorProfile = await this.profileRepository.findOne({
      where: { user: { id: authorUserId } },
    });
    if (!authorProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== authorProfile.id) {
      throw new ForbiddenException('You can only update your own comments');
    }

    comment.content = dto.content;
    return this.commentRepository.save(comment);
  }

  async deleteComment(authorUserId: number, commentId: number) {
    const authorProfile = await this.profileRepository.findOne({
      where: { user: { id: authorUserId } },
    });
    if (!authorProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== authorProfile.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentRepository.remove(comment);
  }

  async getProfileComments(profileId: number) {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.commentRepository.find({
      where: { profileId },
      relations: ['author', 'author.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyComments(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.commentRepository.find({
      where: { authorId: userProfile.id },
      relations: ['profile', 'profile.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyCommentsOnProfile(userId: number, profileId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.commentRepository.find({
      where: { 
        authorId: userProfile.id,
        profileId: profileId 
      },
      relations: ['profile', 'profile.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'author.user', 'profile', 'profile.user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async canCommentProfile(userId: number, profileId: number): Promise<boolean> {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile || userProfile.id === profileId) {
      return false;
    }

    return this.checkSubscriptionHistory(userProfile.id, profileId);
  }

  async getCommentsCount(profileId: number): Promise<number> {
    return this.commentRepository.count({
      where: { profileId },
    });
  }
}
