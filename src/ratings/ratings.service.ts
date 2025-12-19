import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from 'src/entities/rating.entity';
import { Profile } from 'src/entities/profile.entity';
import { Subscription, SubscriptionStatus } from 'src/entities/subscription.entity';
import { CreateRatingDto } from 'src/dtos/ratings/create-rating.dto';
import { UpdateRatingDto } from 'src/dtos/ratings/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,

    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  private async checkSubscriptionHistory(raterProfileId: number, ratedProfileId: number): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findOne({
      where: [
        { 
          followerId: raterProfileId, 
          followingId: ratedProfileId,
          status: SubscriptionStatus.MATCHED 
        },
        { 
          followerId: ratedProfileId, 
          followingId: raterProfileId,
          status: SubscriptionStatus.MATCHED 
        },
      ],
    });

    if (!subscription) {
      const historyCount = await this.subscriptionRepository.count({
        where: [
          { followerId: raterProfileId, followingId: ratedProfileId },
          { followerId: ratedProfileId, followingId: raterProfileId },
        ],
      });
      return historyCount >= 2;
    }

    return !!subscription;
  }

  async rateProfile(raterUserId: number, ratedProfileId: number, dto: CreateRatingDto) {
    const raterProfile = await this.profileRepository.findOne({
      where: { user: { id: raterUserId } },
    });
    if (!raterProfile) {
      throw new NotFoundException('Your profile not found');
    }

    if (raterProfile.id === ratedProfileId) {
      throw new BadRequestException('Cannot rate your own profile');
    }

    const ratedProfile = await this.profileRepository.findOne({
      where: { id: ratedProfileId },
    });
    if (!ratedProfile) {
      throw new NotFoundException('Profile not found');
    }

    const hasSubscriptionHistory = await this.checkSubscriptionHistory(
      raterProfile.id,
      ratedProfileId
    );

    if (!hasSubscriptionHistory) {
      throw new ForbiddenException(
        'You can only rate profiles you have been matched with'
      );
    }

    let rating = await this.ratingRepository.findOne({
      where: {
        raterId: raterProfile.id,
        ratedId: ratedProfileId,
      },
    });

    if (rating) {
      rating.score = dto.score;
    } else {
      rating = this.ratingRepository.create({
        raterId: raterProfile.id,
        ratedId: ratedProfileId,
        score: dto.score,
      });
    }

    return this.ratingRepository.save(rating);
  }

  async updateRating(raterUserId: number, ratedProfileId: number, dto: UpdateRatingDto) {
    const raterProfile = await this.profileRepository.findOne({
      where: { user: { id: raterUserId } },
    });
    if (!raterProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const rating = await this.ratingRepository.findOne({
      where: {
        raterId: raterProfile.id,
        ratedId: ratedProfileId,
      },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    if (dto.score !== undefined) rating.score = dto.score;

    return this.ratingRepository.save(rating);
  }

  async deleteRating(raterUserId: number, ratedProfileId: number) {
    const raterProfile = await this.profileRepository.findOne({
      where: { user: { id: raterUserId } },
    });
    if (!raterProfile) {
      throw new NotFoundException('Your profile not found');
    }

    const rating = await this.ratingRepository.findOne({
      where: {
        raterId: raterProfile.id,
        ratedId: ratedProfileId,
      },
    });

    if (!rating) {
      throw new NotFoundException('Rating not found');
    }

    await this.ratingRepository.remove(rating);
  }

  async getMyRatings(userId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.ratingRepository.find({
      where: { raterId: userProfile.id },
      relations: ['rated', 'rated.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProfileRatings(profileId: number) {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.ratingRepository.find({
      where: { ratedId: profileId },
      relations: ['rater', 'rater.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProfileAverageRating(profileId: number) {
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.score)', 'average')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.ratedId = :profileId', { profileId })
      .getRawOne();

    return {
      profileId,
      averageRating: result.average ? parseFloat(result.average).toFixed(2) : null,
      totalRatings: parseInt(result.count),
    };
  }

  async getMyRatingForProfile(userId: number, profileId: number) {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile) {
      throw new NotFoundException('Your profile not found');
    }

    return this.ratingRepository.findOne({
      where: {
        raterId: userProfile.id,
        ratedId: profileId,
      },
    });
  }

  async canRateProfile(userId: number, profileId: number): Promise<boolean> {
    const userProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userProfile || userProfile.id === profileId) {
      return false;
    }

    return this.checkSubscriptionHistory(userProfile.id, profileId);
  }
}
