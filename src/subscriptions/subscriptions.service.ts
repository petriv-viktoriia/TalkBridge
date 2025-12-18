import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from 'src/entities/subscription.entity';
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async subscribe(followerUserId: number, followingProfileId: number) {
    const followerProfile = await this.profileRepository.findOne({
      where: { user: { id: followerUserId } },
    });
    if (!followerProfile) {
      throw new NotFoundException('Your profile not found');
    }

    if (followerProfile.id === followingProfileId) {
      throw new BadRequestException('Cannot subscribe to yourself');
    }

    const followingProfile = await this.profileRepository.findOne({
      where: { id: followingProfileId },
    });
    if (!followingProfile) {
      throw new NotFoundException('Profile not found');
    }

    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        followerId: followerProfile.id,
        followingId: followingProfileId,
      },
    });

    if (existingSubscription) {
      if (existingSubscription.status === SubscriptionStatus.REJECTED) {
        existingSubscription.status = SubscriptionStatus.PENDING;
        return this.subscriptionRepository.save(existingSubscription);
      }
      throw new BadRequestException('Subscription already exists');
    }

    const subscription = this.subscriptionRepository.create({
      followerId: followerProfile.id,
      followingId: followingProfileId,
      status: SubscriptionStatus.PENDING,
    });

    await this.subscriptionRepository.save(subscription);

    const reverseSubscription = await this.subscriptionRepository.findOne({
      where: {
        followerId: followingProfileId,
        followingId: followerProfile.id,
        status: SubscriptionStatus.PENDING,
      },
    });

    if (reverseSubscription) {
      const matchedAt = new Date();
      
      subscription.status = SubscriptionStatus.MATCHED;
      subscription.matchedAt = matchedAt;
      
      reverseSubscription.status = SubscriptionStatus.MATCHED;
      reverseSubscription.matchedAt = matchedAt;

      await this.subscriptionRepository.save([subscription, reverseSubscription]);

      return {
        ...subscription,
        isMatch: true,
        message: 'It\'s a match! 🎉',
      };
    }

    return subscription;
  }

  async unsubscribe(followerUserId: number, followingProfileId: number) {
    const followerProfile = await this.profileRepository.findOne({
      where: { user: { id: followerUserId } },
    });
    if (!followerProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: {
        followerId: followerProfile.id,
        followingId: followingProfileId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === SubscriptionStatus.MATCHED) {
      const reverseSubscription = await this.subscriptionRepository.findOne({
        where: {
          followerId: followingProfileId,
          followingId: followerProfile.id,
        },
      });

      if (reverseSubscription) {
        reverseSubscription.status = SubscriptionStatus.PENDING;
        reverseSubscription.matchedAt = null;
        await this.subscriptionRepository.save(reverseSubscription);
      }
    }

    await this.subscriptionRepository.remove(subscription);
  }

  async rejectSubscription(userId: number, subscriptionId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId, followingId: userProfile.id },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.REJECTED;
    return this.subscriptionRepository.save(subscription);
  }

  async getMySubscriptions(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.subscriptionRepository.find({
      where: { followerId: userProfile.id },
      relations: ['following', 'following.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyFollowers(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.subscriptionRepository.find({
      where: { followingId: userProfile.id },
      relations: ['follower', 'follower.user'],
      order: { createdAt: 'DESC' },
    });
  }
  
  async getMyMatches(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.subscriptionRepository.find({
      where: [
        { followerId: userProfile.id, status: SubscriptionStatus.MATCHED },
        { followingId: userProfile.id, status: SubscriptionStatus.MATCHED },
      ],
      relations: ['follower', 'following', 'follower.user', 'following.user'],
      order: { matchedAt: 'DESC' },
    });
  }

  async checkMatch(userId: number, otherProfileId: number): Promise<boolean> {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      return false;
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: [
        { 
          followerId: userProfile.id, 
          followingId: otherProfileId,
          status: SubscriptionStatus.MATCHED 
        },
        { 
          followerId: otherProfileId, 
          followingId: userProfile.id,
          status: SubscriptionStatus.MATCHED 
        },
      ],
    });

    return !!subscription;
  }

  async getSubscriptionStats(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const followersCount = await this.subscriptionRepository.count({
      where: { followingId: userProfile.id },
    });

    const followingCount = await this.subscriptionRepository.count({
      where: { followerId: userProfile.id },
    });

    const matchesCount = await this.subscriptionRepository.count({
      where: [
        { followerId: userProfile.id, status: SubscriptionStatus.MATCHED },
      ],
    });

    return {
      followers: followersCount,
      following: followingCount,
      matches: matchesCount,
    };
  }
}
